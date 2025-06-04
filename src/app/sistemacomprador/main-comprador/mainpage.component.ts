import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { Component, OnInit, signal } from '@angular/core';
import { CarouselModule, Carousel } from 'primeng/carousel';
import { ToastModule } from 'primeng/toast';
import { deleteDoc, updateDoc } from 'firebase/firestore';
import { Firestore, collection, query, where, collectionData, getDoc, doc } from '@angular/fire/firestore';
import { DialogModule } from 'primeng/dialog';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { ScrollTopModule } from 'primeng/scrolltop';

@Component({
  selector: 'app-mainpage',
  standalone: true,
  imports: [ScrollPanelModule, RouterModule, ScrollTopModule, FormsModule, CarouselModule, CardModule, DialogModule, RatingModule, ToastModule, MenuModule, ButtonModule, CommonModule],
  templateUrl: './mainpage.component.html',
  styleUrl: './mainpage.component.css',
  providers: [MessageService]
})
export class MainpageComponent implements OnInit {

  @ViewChild('menuContainer', { read: ElementRef })
  menuContainer!: ElementRef;

  @ViewChildren('provinciaCarousel') carousels!: QueryList<Carousel>;

  // Add new properties for provinces
  productosPorProvincia: { [key: string]: any[] } = {};
  provincias: string[] = [];
  
  // Lista completa de provincias del Ecuador
  todasProvinciasEcuador: string[] = [
    'Azuay',
    'Bolívar',
    'Cañar',
    'Carchi',
    'Chimborazo',
    'Cotopaxi',
    'El Oro',
    'Esmeraldas',
    'Galápagos',
    'Guayas',
    'Imbabura',
    'Loja',
    'Los Ríos',
    'Manabí',
    'Morona Santiago',
    'Napo',
    'Orellana',
    'Pastaza',
    'Pichincha',
    'Santa Elena',
    'Santo Domingo de los Tsáchilas',
    'Sucumbíos',
    'Tungurahua',
    'Zamora Chinchipe'
  ];

  goToHome() {
    this.router.navigate(['comprador/main-comprador']);
  }

  menuItems: MenuItem[] = [];

  ngOnInit() {
    this.menuItems = [
      { label: 'Profile', icon: 'fas fa-user', command: () => this.goToProfile() },
      { label: 'Settings', icon: 'fas fa-cog', command: () => this.openSettings() },
      { label: 'Logout', icon: 'fas fa-sign-out-alt', command: () => this.logout() }
    ];

    this.cargarProductosPorProvincia();
  }

  goToProfile() {
    console.log('Profile clicked');
  }

  openSettings() {
    console.log('Settings clicked');
  }

  logout() {
    console.log('Logged out');
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private firestore: Firestore
  ) { }

  async cargarProductosPorProvincia() {
    const productosRef = collection(this.firestore, 'productos');
    const MINIMUM_PRODUCTS = 7; // Constante para el mínimo de productos requeridos
    
    // Inicializar el objeto con todas las provincias
    this.todasProvinciasEcuador.forEach(provincia => {
      this.productosPorProvincia[provincia] = [];
    });
    
    // Get all products
    collectionData(productosRef, { idField: 'id' }).subscribe((productos) => {
      // Reset arrays for each province while maintaining the structure
      this.todasProvinciasEcuador.forEach(provincia => {
        this.productosPorProvincia[provincia] = [];
      });
      
      // Group products by province
      productos.forEach((product: any) => {
        const provincia = product.provincia?.state;
        
        // Solo agregar si la provincia existe en nuestra lista
        if (provincia && this.todasProvinciasEcuador.includes(provincia)) {
          this.productosPorProvincia[provincia].push({
            ...product,
            formattedVegetal: this.formatVegetal(product.Vegetal)
          });
        }
      });
      
      // Update provinces list - only include provinces with minimum required products
      this.provincias = this.todasProvinciasEcuador.filter(provincia => 
        this.productosPorProvincia[provincia].length >= MINIMUM_PRODUCTS
      );
      
      console.log('Productos por provincia:', this.productosPorProvincia);
      console.log('Provincias con productos suficientes:', this.provincias);
    });
  }

  formatVegetal(name: string): string {
    if (!name) return '';
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, '');
  }

  stepCarousel(provincia: string, direction: number) {
    const carousel = this.carousels.find((item, index) => {
      return this.provincias[index] === provincia;
    });
    
    if (carousel) {
      const event = new MouseEvent('click');
      if (direction === 1) {
        carousel.navBackward(event);
      } else {
        carousel.navForward(event);
      }
    }
  }

  formatProvincia(provincia: string): string {
    return provincia.toLowerCase().normalize("NFD")
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/\s+/g, '-'); // Replace spaces with hyphens
  }
  provinciaFormatted: string = '';
}





