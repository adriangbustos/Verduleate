import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Firestore, collection, query, where, collectionData, DocumentData, doc, updateDoc, deleteDoc, getDoc } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth.service';
import { Observable, combineLatest, Subscription, of, from } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { User } from '@angular/fire/auth';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { loadStripe } from '@stripe/stripe-js';

interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  productDetails?: {
    Vegetal: string;
    formattedVegetal: string;
    precio: number;
    cantidadDisponible: number;
    agricultor: string;
    agricultorId: string;
    medida: {
      peso: string;
    };
  };
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit, OnDestroy {
  private readonly STRIPE_PUBLISHABLE_KEY = 'pk_test_51RgSwWRt6d3ybFYlZnuY1cWTVYHqUTaZIWdLRKbzzqUlNNzgrTUlkX67949cY9xQxuSrJM16vY0Cp0Zw1LXKfcQM00VmYqladn';
  cartItems: CartItem[] = [];
  isLoading = true;
  private subscriptions: Subscription[] = [];

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    console.log('CartComponent initialized');
    this.loadCartItems();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  formatVegetal(name: string): string {
    if (!name) return '';
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, '');
  }

  // Función para calcular el precio total de un item
  calculateItemTotal(item: CartItem): number {
    if (!item.productDetails?.precio || item.quantity === undefined) return 0;
    return item.productDetails.precio * item.quantity;
  }

  // Función para obtener el total del carrito
  getTotal(): number {
    return this.cartItems.reduce((sum, item) => {
      return sum + this.calculateItemTotal(item);
    }, 0);
  }

  async updateQuantity(item: CartItem, change: number) {
    const increment = 0.25;
    const newQuantity = Number((item.quantity + (change * increment)).toFixed(2)); // Aseguramos 2 decimales
    
    if (newQuantity >= 0 && item.productDetails && newQuantity <= item.productDetails.cantidadDisponible) {
      try {
        const cartItemRef = doc(this.firestore, 'carts', item.id);
        await updateDoc(cartItemRef, { quantity: newQuantity });
        item.quantity = newQuantity;
      } catch (error) {
        console.error('Error al actualizar la cantidad:', error);
      }
    }
  }

  loadCartItems() {
    console.log('Starting to load cart items...');
    const userSub = this.authService.getCurrentUserObservable().pipe(
      catchError((error: Error) => {
        console.error('Error al obtener el usuario:', error.message);
        this.isLoading = false;
        return of(null);
      }),
      switchMap(user => {
        if (!user) {
          console.log('No user found or user not authenticated');
          this.isLoading = false;
          return of([]);
        }

        console.log('User authenticated:', user.uid);
        const cartRef = collection(this.firestore, 'carts');
        const cartQuery = query(cartRef, where('userId', '==', user.uid));
        
        return collectionData(cartQuery, { idField: 'id' }).pipe(
          switchMap((cartItems: DocumentData[]) => {
            console.log('Cart items found:', cartItems.length);
            if (cartItems.length === 0) {
              this.isLoading = false;
              return of([]);
            }

            const productObservables = cartItems.map(cartItem => {
              console.log('Processing cart item:', cartItem);
              const productDocRef = doc(this.firestore, 'productos', cartItem['productId']);
              
              return from(getDoc(productDocRef)).pipe(
                map(productDoc => {
                  if (productDoc.exists()) {
                    const product = productDoc.data();
                    console.log('Product found:', product);
                    return {
                      id: cartItem['id'],
                      userId: cartItem['userId'],
                      productId: cartItem['productId'],
                      quantity: Number(cartItem['quantity'] || 0), // Aseguramos que quantity sea número
                      productDetails: {
                        ...product,
                        formattedVegetal: this.formatVegetal(product['Vegetal'] as string),
                        cantidadDisponible: Number(product['cantidadDisponible']) || 0,
                        precio: Number(product['precio']) || 0,
                        Vegetal: product['Vegetal'] || '',
                        agricultor: product['agricultor'] || '',
                        agricultorId: product['agricultorId'] || '',
                        medida: {
                          peso: product['medida']?.peso || 'unidad'
                        }
                      }
                    } as CartItem;
                  }
                  console.log('Product not found for ID:', cartItem['productId']);
                  return null;
                })
              );
            });

            return productObservables.length > 0 ? combineLatest(productObservables) : of([]);
          })
        );
      })
    ).subscribe({
      next: (items) => {
        this.cartItems = items.filter((item): item is CartItem => item !== null);
        this.isLoading = false;
        console.log('Final cart items loaded:', this.cartItems);
      },
      error: (error) => {
        console.error('Error loading cart items:', error);
        this.isLoading = false;
      }
    });

    this.subscriptions.push(userSub);
  }

  async removeItem(itemId: string) {
    try {
      const cartItemRef = doc(this.firestore, 'carts', itemId);
      await deleteDoc(cartItemRef);
      this.cartItems = this.cartItems.filter(item => item.id !== itemId);
    } catch (error) {
      console.error('Error al eliminar el item:', error);
    }
  }

  goToMainPage() {
    this.router.navigate(['/comprador/main-comprador']);
  }

  async proceedToCheckout() {
    try {
      const stripe = await loadStripe(this.STRIPE_PUBLISHABLE_KEY);
      
      if (!stripe) {
        throw new Error('Could not initialize Stripe');
      }

      const total = this.getTotal();
      if (total <= 0) {
        throw new Error('Cart is empty');
      }

      // Create a description of the cart items
      const cartDescription = this.cartItems.map(item => 
        `${item.productDetails?.Vegetal} (${item.quantity} ${item.productDetails?.medida?.peso})`
      ).join(', ');

      // Create checkout session
      const response = await this.http.post<{sessionId: string; url: string}>(
        'http://localhost:3000/create-checkout-session',
        {
          productName: 'Compra de Verduras',
          amount: Math.round(total * 100), // Convert to cents
          description: cartDescription
        }
      ).toPromise();

      if (!response?.sessionId) {
        throw new Error('Failed to create checkout session');
      }

      // Redirect to checkout
      const result = await stripe.redirectToCheckout({
        sessionId: response.sessionId
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      alert(error.message || 'An error occurred during payment processing');
    }
  }
}
