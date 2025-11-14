import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Firestore, collection, query, where, getDocs, doc, getDoc, docData, addDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable, from, switchMap } from 'rxjs';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { Timestamp } from 'firebase/firestore';
import { Auth, user } from '@angular/fire/auth';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

interface Producto {
  Vegetal: string;
  agricultorId: string;
  cantidadDisponible: number;
  categoria: {
    clase: string;
  };
  descripcionCultivo: string;
  fechaCultivado: Timestamp;
  medida: {
    peso: string;
  };
  precio: number;
  productId: string;
  provincia: {
    state: string;
  };
}

interface Agricultor {
  fullname: string;
  fincaname: string;
  descripcionFinca: string;
  address: string;
  cellphone: string;
  email: string;
}

@Component({
  selector: 'app-productspage',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenuModule,
    ButtonModule,
    FormsModule,
    CardModule,
    ScrollPanelModule,
    ToastModule
  ],
  templateUrl: './productspage.component.html',
  styleUrl: './productspage.component.css',
  providers: [MessageService]
})
export class ProductspageComponent implements OnInit {
  productId: string = '';
  producto$!: Observable<Producto & { agricultor?: Agricultor }>;
  userId: string | undefined;

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private router: Router,
    private auth: Auth,
    private messageService: MessageService,
    private authService: AuthService
  ) {
    // Get current user ID
    user(this.auth).subscribe(user => {
      this.userId = user?.uid;
    });
  }

  isLoading2: boolean = false;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.productId = params['id'];
    });

    const docRef = doc(this.firestore, `productos/${this.productId}`);
    const producto$ = docData(docRef) as Observable<Producto>;

    this.producto$ = producto$.pipe(
      switchMap(producto => {
        if (producto.agricultorId) {
          const agricultorDoc = doc(this.firestore, `agricultores/${producto.agricultorId}`);
          return from(getDoc(agricultorDoc)).pipe(
            switchMap(agricultorSnap => {
              if (agricultorSnap.exists()) {
                return from([{
                  ...producto,
                  agricultor: agricultorSnap.data() as Agricultor
                }]);
              }
              return from([producto]);
            })
          );
        }
        return from([producto]);
      })
    );

    this.menuItems = [
      { label: 'Perfil', icon: 'fas fa-user', command: () => this.goToProfile() },
      { label: 'Carrito', icon: 'fas fa-shopping-cart', command: () => this.goToCart() },
      { label: 'Cerrar Sesión', icon: 'fas fa-sign-out-alt', command: () => this.logout() },
    ];
  }

  formatVegetal(name: string): string {
    if (!name) return '';
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, '');
  }

  menuItems: MenuItem[] = [];

    goToProfile() {
    this.router.navigate(['/comprador/profile']);
  }

  async logout() {
    try {
      this.isLoading2 = true;

      await this.authService.logout();

      // Espera 1 segundo
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.isLoading2 = false;
      this.router.navigate(['comprador/login-comprador']);

    } catch (error: any) {
      this.isLoading2 = false;
      const cleanMessage = error.toString().replace(/^Error:\s*/, '');
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: cleanMessage
      });
    }
  }

  goToCart() {
    this.router.navigate(['/comprador/cart']);
  }

  async addToCart(producto: Producto) {
    if (!this.userId) {
      console.error('No user logged in');
      return;
    }

    try {
      const cartCollection = collection(this.firestore, 'carts');
      await addDoc(cartCollection, {
        productId: producto.productId,
        userId: this.userId,
        quantity: 0
      });
      this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto agregado al carrito' });
    } catch (error) {
      console.error('Error adding product to cart:', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo agregar el producto al carrito' });
    }
  }
}
