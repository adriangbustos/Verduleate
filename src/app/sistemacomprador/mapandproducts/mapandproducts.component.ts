import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { Router } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { deleteDoc, getDocs, updateDoc } from 'firebase/firestore';
import { Firestore, collection, query, where, collectionData, getDoc, doc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';

interface Producto {
  Vegetal: string;
  agricultorId: string;
  cantidadDisponible: number;
  categoria: {
    clase: string;
  };
  descripcionCultivo: string;
  fechaCultivado: string;
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
  address: string;
  fincaname: string;
  fullname: string;
  latitude?: number;
  longitude?: number;
}

interface ProductWithLocation {
  producto: Producto;
  agricultor: Agricultor;
  coordinates?: [number, number];
}

@Component({
  selector: 'app-mapandproducts',
  standalone: true,
  imports: [RouterModule, CommonModule, ButtonModule, FormsModule, MenuModule],
  templateUrl: './mapandproducts.component.html',
  styleUrl: './mapandproducts.component.css'
})
export class MapandproductsComponent implements OnInit {
  provincia: string = '';
  productsWithLocation: ProductWithLocation[] = [];
  isLoading: boolean = true;
  selectedProduct: ProductWithLocation | null = null;
  private map: L.Map | null = null;
  private markers: L.LayerGroup = L.layerGroup();

  private greenIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  private highlightedIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  private provinceCoordinates: { [key: string]: { lat: number; lng: number; zoom: number } } = {
    'Guayas': { lat: -2.1894, lng: -79.8891, zoom: 9 },
    'Pichincha': { lat: -0.1807, lng: -78.4678, zoom: 9 },
    'Manabi': { lat: -0.9538, lng: -80.7089, zoom: 9 },
    'Los Rios': { lat: -1.0186, lng: -79.4608, zoom: 9 },
    'El Oro': { lat: -3.2591, lng: -79.9583, zoom: 9 },
    'Esmeraldas': { lat: 0.9682, lng: -79.6519, zoom: 9 },
    'Azuay': { lat: -2.9001, lng: -79.0059, zoom: 9 },
    'Imbabura': { lat: 0.3499, lng: -78.1263, zoom: 9 },
    'Carchi': { lat: 0.8118, lng: -77.7174, zoom: 9 },
    'Cotopaxi': { lat: -0.9333, lng: -78.6167, zoom: 9 },
    'Chimborazo': { lat: -1.6650, lng: -78.6542, zoom: 9 },
    'Tungurahua': { lat: -1.2490, lng: -78.6167, zoom: 9 },
    'Bolivar': { lat: -1.5938, lng: -79.0007, zoom: 9 },
    'Canar': { lat: -2.5588, lng: -78.9375, zoom: 9 },
    'Loja': { lat: -3.9939, lng: -79.2042, zoom: 9 },
    'Santo Domingo de los Tsachilas': { lat: -0.2521, lng: -79.1753, zoom: 9 },
    'Santa Elena': { lat: -2.2267, lng: -80.8583, zoom: 9 },
    'Morona Santiago': { lat: -2.3049, lng: -78.1167, zoom: 9 },
    'Napo': { lat: -0.9953, lng: -77.8129, zoom: 9 },
    'Pastaza': { lat: -1.4884, lng: -78.0031, zoom: 9 },
    'Zamora Chinchipe': { lat: -4.0669, lng: -78.9509, zoom: 9 },
    'Sucumbios': { lat: 0.0833, lng: -76.8833, zoom: 9 },
    'Orellana': { lat: -0.4586, lng: -76.9875, zoom: 9 },
    'Galapagos': { lat: -0.9538, lng: -90.9656, zoom: 8 }
  };

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private router: Router
  ) { }

  onGoBack() {
    this.router.navigate(['/comprador/main-comprador']);
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const provinciaParam = params.get('provincia') || '';
      this.provincia = provinciaParam.charAt(0).toUpperCase() + provinciaParam.slice(1).toLowerCase();
      this.cargarProductosPorProvincia(this.provincia);
    });

    this.menuItems = [
      { label: 'Profile', icon: 'fas fa-user', command: () => this.goToProfile() },
      { label: 'Settings', icon: 'fas fa-cog', command: () => this.openSettings() },
      { label: 'Cart', icon: 'fas fa-shopping-cart', command: () => this.goToCart() },
      { label: 'Logout', icon: 'fas fa-sign-out-alt', command: () => this.logout() },
    ];
  }

  ngAfterViewInit() {
    this.initMap();
  }

  selectProduct(product: ProductWithLocation) {
    this.selectedProduct = product;
    this.updateMapMarkers();
    
    if (product.coordinates && this.map) {
      this.map.setView(product.coordinates, 13);
    }
  }

  private async cargarProductosPorProvincia(provincia: string) {
    try {
      this.isLoading = true;
      this.selectedProduct = null;
      
      const productosRef = collection(this.firestore, 'productos');
      const q = query(productosRef, where('provincia.state', '==', provincia));
      const querySnapshot = await getDocs(q);
      
      this.productsWithLocation = [];

      const promises = querySnapshot.docs.map(async (docSnapshot) => {
        const producto = docSnapshot.data() as Producto;
        
        if (producto.agricultorId) {
          const agricultorDoc = doc(this.firestore, 'agricultores', producto.agricultorId);
          const agricultorSnapshot = await getDoc(agricultorDoc);
          
          if (agricultorSnapshot.exists()) {
            const agricultor = agricultorSnapshot.data() as Agricultor;
            
            // Use stored coordinates directly
            let coordinates: [number, number] | undefined = undefined;
            if (agricultor.latitude !== undefined && agricultor.longitude !== undefined) {
              coordinates = [agricultor.latitude, agricultor.longitude];
            }
            
            const productWithLocation: ProductWithLocation = {
              producto,
              agricultor,
              coordinates
            };
            return productWithLocation;
          }
        }
        return null;
      });

      const results = await Promise.all(promises);
      this.productsWithLocation = results.filter((item): item is ProductWithLocation => item !== null);
      
      this.updateMapMarkers();
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private initMap(): void {
    if (!this.map) {
      const coordinates = this.provinceCoordinates[this.provincia] || 
        { lat: -1.8312, lng: -78.1834, zoom: 7 };

      try {
        const mapElement = document.getElementById('map');
        if (!mapElement) {
          console.error('Map element not found in DOM');
          return;
        }

        this.map = L.map('map').setView([coordinates.lat, coordinates.lng], coordinates.zoom);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);

        this.markers.addTo(this.map);
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }
  }

  private updateMapMarkers(): void {
    if (!this.map) return;

    this.markers.clearLayers();

    this.productsWithLocation.forEach(item => {
      if (item.coordinates) {
        const isSelected = this.selectedProduct === item;
        const icon = isSelected ? this.highlightedIcon : this.greenIcon;
        
        const marker = L.marker(item.coordinates, { icon })
          .bindPopup(`
            <b>${item.agricultor.fincaname}</b><br>
            Agricultor: ${item.agricultor.fullname}<br>
            Producto: ${item.producto.Vegetal}<br>
            Precio: $${item.producto.precio}/${item.producto.medida.peso}<br>
            Cantidad disponible: ${item.producto.cantidadDisponible}
          `);
        
        if (isSelected) {
          marker.openPopup();
        }
        
        this.markers.addLayer(marker);
      }
    });

    if (!this.selectedProduct && this.markers.getLayers().length > 0) {
      const group = L.featureGroup(this.markers.getLayers());
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
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
    this.router.navigate(['/comprador/cart']);
  }
}
