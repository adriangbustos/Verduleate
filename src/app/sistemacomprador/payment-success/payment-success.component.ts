import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Firestore, collection, query, where, getDocs, deleteDoc, doc } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth.service';
import { Subscription, timer } from 'rxjs';
import { take, retryWhen, delayWhen, tap, timeout, filter } from 'rxjs/operators';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div class="success-container">
      <div class="success-content" [class.loading]="isLoading">
        <div class="success-icon">✓</div>
        <h1>¡Pago Exitoso!</h1>
        <p>Tu pedido ha sido procesado correctamente.</p>
        
        <div *ngIf="isLoading" class="status-message loading">
          {{ loadingMessage }}
        </div>
        <div *ngIf="error" class="status-message error">
          {{ error }}
        </div>
        <div *ngIf="cartCleared" class="status-message success">
          ¡Tu carrito ha sido limpiado exitosamente!
        </div>
        
        <button 
          (click)="goToMainPage()" 
          class="main-button" 
          [disabled]="isLoading">
          Volver a la Página Principal
        </button>
      </div>
    </div>
  `,
  styles: [`
    .success-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    .success-content {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      width: 90%;
    }

    .success-content.loading {
      opacity: 0.7;
      pointer-events: none;
    }

    .success-icon {
      width: 80px;
      height: 80px;
      background: #4CAF50;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      color: white;
      font-size: 40px;
    }

    h1 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    p {
      color: #666;
      margin-bottom: 1rem;
    }

    .status-message {
      margin: 1rem 0;
      padding: 0.75rem;
      border-radius: 5px;
      font-size: 0.9rem;
    }

    .status-message.loading {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .status-message.error {
      background-color: #ffebee;
      color: #c62828;
    }

    .status-message.success {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .main-button {
      background-color: rgb(75, 183, 58);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s;
    }

    .main-button:hover:not(:disabled) {
      background-color: rgb(65, 160, 50);
    }

    .main-button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
  `]
})
export class PaymentSuccessComponent implements OnInit, OnDestroy {
  isLoading = false;
  error: string | null = null;
  cartCleared = false;
  private clearingCart = false;
  private subscription: Subscription | null = null;
  loadingMessage = 'Preparando...';
  private retryCount = 0;
  private maxRetries = 10;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private firestore: Firestore,
    private authService: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    console.log('PaymentSuccessComponent initialized');
    this.route.queryParams.subscribe(params => {
      const sessionId = params['session_id'];
      console.log('Session ID:', sessionId);
      
      if (!sessionId) {
        console.error('No session ID found in URL');
        this.error = 'Error: No se pudo verificar el pago.';
        return;
      }

      // Verify the session with Stripe
      this.verifyStripeSession(sessionId);
    });
  }

  ngOnDestroy() {
    console.log('PaymentSuccessComponent destroyed');
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private async verifyStripeSession(sessionId: string) {
    try {
      this.isLoading = true;
      this.loadingMessage = 'Verificando pago...';

      // Verify the session with your backend
      const response = await this.http.get(`http://localhost:3000/verify-session/${sessionId}`).toPromise();
      
      if (response) {
        console.log('Session verified successfully');
        this.clearCart();
      } else {
        throw new Error('Invalid session');
      }
    } catch (error) {
      console.error('Error verifying session:', error);
      this.error = 'Error: No se pudo verificar el pago.';
      this.isLoading = false;
    }
  }

  private async clearCart() {
    if (this.clearingCart) {
      console.log('Already clearing cart, skipping');
      return;
    }
    
    console.log('Starting cart clearing process');
    this.clearingCart = true;
    this.error = null;
    this.retryCount = 0;

    this.subscription = this.authService.getCurrentUserObservable()
      .pipe(
        tap(user => console.log('Auth state changed:', user ? 'User authenticated' : 'No user')),
        timeout(3000),
        retryWhen(errors => 
          errors.pipe(
            tap(error => {
              this.retryCount++;
              console.log(`Retry attempt ${this.retryCount}/${this.maxRetries}`, error);
              this.loadingMessage = `Verificando sesión... (Intento ${this.retryCount}/${this.maxRetries})`;
            }),
            delayWhen(() => timer(1500)),
            take(this.maxRetries)
          )
        ),
        filter(user => user !== null)
      )
      .subscribe({
        next: async (user) => {
          if (!user) {
            console.log('No user found after auth check');
            this.error = 'No se pudo verificar tu sesión. Por favor, vuelve a iniciar sesión.';
            this.isLoading = false;
            this.clearingCart = false;
            return;
          }

          console.log('User authenticated, proceeding to clear cart', user.uid);
          try {
            this.loadingMessage = 'Limpiando carrito...';
            const cartRef = collection(this.firestore, 'carts');
            const q = query(cartRef, where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);

            console.log(`Found ${querySnapshot.size} items in cart`);
            const deletePromises = querySnapshot.docs.map(async (document) => {
              const docRef = doc(this.firestore, 'carts', document.id);
              await deleteDoc(docRef);
              console.log('Deleted cart item:', document.id);
            });

            await Promise.all(deletePromises);
            this.cartCleared = true;
            console.log('Cart cleared successfully');
          } catch (error) {
            console.error('Error clearing cart:', error);
            this.error = 'Hubo un error al limpiar el carrito. Por favor, inténtalo de nuevo más tarde.';
          } finally {
            this.isLoading = false;
            this.clearingCart = false;
          }
        },
        error: (error) => {
          console.error('Auth error after retries:', error);
          this.error = 'No se pudo verificar tu sesión después de varios intentos. Por favor, vuelve a iniciar sesión.';
          this.isLoading = false;
          this.clearingCart = false;
        }
      });
  }

  goToMainPage() {
    this.router.navigate(['/comprador/main-comprador']);
  }
}