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
import { OverlayPanelModule } from 'primeng/overlaypanel';

@Component({
  selector: 'app-mainpage',
  standalone: true,
  imports: [
    ScrollPanelModule, 
    RouterModule, 
    ScrollTopModule, 
    FormsModule, 
    CarouselModule, 
    CardModule, 
    DialogModule, 
    RatingModule, 
    ToastModule, 
    MenuModule, 
    ButtonModule, 
    CommonModule,
    OverlayPanelModule
  ],
  templateUrl: './mainpage.component.html',
  styleUrl: './mainpage.component.css',
  providers: [MessageService]
})
export class MainpageComponent implements OnInit {

  @ViewChild('menuContainer', { read: ElementRef })
  menuContainer!: ElementRef;

  @ViewChildren('provinciaCarousel') carousels!: QueryList<Carousel>;

  productosPorProvincia: { [key: string]: any[] } = {};
  provincias: string[] = [];
  isLoading: boolean = true;
  isLoadingCategory: boolean = false;
  skeletonArray = new Array(7);
  selectedCategory: string | null = null;
  productosFiltrados: any[] = [];
  vistaCarrusel: boolean = true;

  categorias = [
    { nombre: 'Hojas', icono: 'fas fa-leaf', clase: 'Hojas' },
    { nombre: 'Hortalizas', icono: 'fas fa-carrot', clase: 'Hortalizas' },
    { nombre: 'Tallos', icono: 'fas fa-seedling', clase: 'Tallos' },
    { nombre: 'Raíces', icono: 'fa-solid fa-tree', clase: 'Raices' },
    { nombre: 'Tubérculos', icono: 'fa-solid fa-pepper-hot', clase: 'Tuberculos' },
    { nombre: 'Bulbos', icono: 'fa-solid fa-lemon', clase: 'Bulbos' },
    { nombre: 'Frutos', icono: 'fas fa-apple-alt', clase: 'Frutos' },
    { nombre: 'Semillas', icono: 'fas fa-seedling', clase: 'Semillas' }
  ];
  
  // Lista completa de provincias del Ecuador
  todasProvinciasEcuador: string[] = [
    'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi',
    'El Oro', 'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja',
    'Los Ríos', 'Manabí', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza',
    'Pichincha', 'Santa Elena', 'Santo Domingo de los Tsáchilas', 'Sucumbíos',
    'Tungurahua', 'Zamora Chinchipe'
  ];

  goToHome() {
    this.router.navigate(['comprador/main-comprador']);
  }

  menuItems: MenuItem[] = [];

  searchQuery: string = '';
  showFiltersMenu: boolean = false;
  sortOptions: MenuItem[] = [
    { 
      label: 'Precio', 
      items: [
        { label: 'Mayor a menor', command: () => this.sortProducts('price', 'desc') },
        { label: 'Menor a mayor', command: () => this.sortProducts('price', 'asc') }
      ]
    },
    {
      label: 'Fecha', 
      items: [
        { label: 'Más recientes', command: () => this.sortProducts('date', 'desc') },
        { label: 'Más antiguos', command: () => this.sortProducts('date', 'asc') }
      ]
    },
    {
      label: 'Alfabéticamente',
      items: [
        { label: 'A-Z', command: () => this.sortProducts('alpha', 'asc') },
        { label: 'Z-A', command: () => this.sortProducts('alpha', 'desc') }
      ]
    }
  ];

  ngOnInit() {
    this.menuItems = [
      { label: 'Profile', icon: 'fas fa-user', command: () => this.goToProfile() },
      { label: 'Settings', icon: 'fas fa-cog', command: () => this.openSettings() },
      { label: 'Logout', icon: 'fas fa-sign-out-alt', command: () => this.logout() }
    ];

    this.cargarProductosPorProvincia();
  }

  seleccionarCategoria(categoria: string) {
    if (this.selectedCategory === categoria) {
      // Si la categoría ya está seleccionada, la deseleccionamos
      this.selectedCategory = null;
      this.vistaCarrusel = true;
      return;
    }

    this.isLoadingCategory = true;
    this.selectedCategory = categoria;
    this.vistaCarrusel = false;
    this.filtrarProductos();
  }

  filtrarProductos() {
    if (!this.selectedCategory) {
      this.vistaCarrusel = true;
      this.isLoadingCategory = false;
      return;
    }

    this.productosFiltrados = [];
    const categoriaSeleccionada = this.categorias.find(cat => cat.nombre === this.selectedCategory);
    
    if (categoriaSeleccionada) {
      Object.values(this.productosPorProvincia).forEach(productos => {
        productos.forEach(producto => {
          if (producto.categoria?.clase === categoriaSeleccionada.clase) {
            this.productosFiltrados.push(producto);
          }
        });
      });
    }

    // Simular un pequeño retraso para mostrar el skeleton
    setTimeout(() => {
      this.isLoadingCategory = false;
    }, 500);
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
    this.isLoading = true;
    const productosRef = collection(this.firestore, 'productos');
    const MINIMUM_PRODUCTS = 7;
    
    this.todasProvinciasEcuador.forEach(provincia => {
      this.productosPorProvincia[provincia] = [];
    });
    
    collectionData(productosRef, { idField: 'id' }).subscribe((productos) => {
      this.todasProvinciasEcuador.forEach(provincia => {
        this.productosPorProvincia[provincia] = [];
      });
      
      productos.forEach((product: any) => {
        const provincia = product.provincia?.state;
        
        if (provincia && this.todasProvinciasEcuador.includes(provincia)) {
          this.productosPorProvincia[provincia].push({
            ...product,
            formattedVegetal: this.formatVegetal(product.Vegetal)
          });
        }
      });
      
      this.provincias = this.todasProvinciasEcuador.filter(provincia => 
        this.productosPorProvincia[provincia].length >= MINIMUM_PRODUCTS
      );
      
      this.isLoading = false;
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
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-');
  }
  provinciaFormatted: string = '';

  searchProducts() {
    if (!this.searchQuery.trim()) {
      this.vistaCarrusel = true;
      this.selectedCategory = null;
      return;
    }

    this.vistaCarrusel = false;
    this.isLoadingCategory = true;
    this.selectedCategory = null;
    
    const query = this.searchQuery.toLowerCase().trim();
    this.productosFiltrados = [];
    
    Object.values(this.productosPorProvincia).forEach(productos => {
      productos.forEach(producto => {
        if (producto.Vegetal.toLowerCase().includes(query)) {
          this.productosFiltrados.push(producto);
        }
      });
    });

    setTimeout(() => {
      this.isLoadingCategory = false;
    }, 500);
  }

  sortProducts(criteria: 'price' | 'date' | 'alpha', order: 'asc' | 'desc') {
    const products = this.vistaCarrusel ? 
      Object.values(this.productosPorProvincia).flat() : 
      this.productosFiltrados;

    if (criteria === 'price') {
      products.sort((a, b) => {
        return order === 'asc' ? 
          a.precio - b.precio : 
          b.precio - a.precio;
      });
    } else if (criteria === 'date') {
      products.sort((a, b) => {
        const dateA = a.creationDate?.seconds || 0;
        const dateB = b.creationDate?.seconds || 0;
        return order === 'asc' ? 
          dateA - dateB : 
          dateB - dateA;
      });
    } else if (criteria === 'alpha') {
      products.sort((a, b) => {
        const nameA = a.Vegetal.toLowerCase();
        const nameB = b.Vegetal.toLowerCase();
        return order === 'asc' ?
          nameA.localeCompare(nameB) :
          nameB.localeCompare(nameA);
      });
    }

    if (this.vistaCarrusel) {
      // Reorganize products by province
      this.todasProvinciasEcuador.forEach(provincia => {
        this.productosPorProvincia[provincia] = products.filter(
          p => p.provincia?.state === provincia
        );
      });
    } else {
      this.productosFiltrados = [...products];
    }
  }
}





