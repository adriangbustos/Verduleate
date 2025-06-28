import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Firestore, collection, query, where, getDocs, doc, getDoc, docData } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable, from, switchMap } from 'rxjs';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { Timestamp } from 'firebase/firestore';

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
    ScrollPanelModule
  ],
  templateUrl: './productspage.component.html',
  styleUrl: './productspage.component.css'
})
export class ProductspageComponent implements OnInit {
  productId: string = '';
  producto$!: Observable<Producto & { agricultor?: Agricultor }>;

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private router: Router
  ) { }

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
      { label: 'Profile', icon: 'fas fa-user', command: () => this.goToProfile() },
      { label: 'Settings', icon: 'fas fa-cog', command: () => this.openSettings() },
      { label: 'Cart', icon: 'fas fa-shopping-cart', command: () => this.goToCart() },
      { label: 'Logout', icon: 'fas fa-sign-out-alt', command: () => this.logout() },
    ];
  }

  formatVegetal(vegetal: string): string {
    return vegetal.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '-');
  }

  menuItems: MenuItem[] = [];

  goToProfile() {
    console.log('Profile clicked');
  }

  openSettings() {
    console.log('Settings clicked');
  }

  logout() {
    console.log('Logged out');
  }

  goToCart() {
    console.log('Cart clicked');
  }
}
