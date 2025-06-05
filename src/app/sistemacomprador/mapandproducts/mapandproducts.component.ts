import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { Firestore, collection, query, where, getDocs, doc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

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
}

interface ProductWithLocation {
  producto: Producto;
  agricultor: Agricultor;
  coordinates?: [number, number];
}

@Component({
  selector: 'app-mapandproducts',
  standalone: true,
  imports: [RouterModule, CommonModule],
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
    'Pichincha': { lat: -0.2299, lng: -78.5249, zoom: 9 },
    'Azuay': { lat: -2.8988, lng: -79.0049, zoom: 9 },
    'Manabi': { lat: -1.0543, lng: -80.4543, zoom: 9 },
    'Los Rios': { lat: -1.8012, lng: -79.1365, zoom: 9 },
    'El Oro': { lat: -3.2662, lng: -79.9611, zoom: 9 },
    'Esmeraldas': { lat: 0.9592, lng: -79.6500, zoom: 9 },
    'Santa Elena': { lat: -2.2267, lng: -80.8583, zoom: 9 },
    'Carchi': { lat: 0.8053, lng: -77.7199, zoom: 9 }
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

  private async geocodeAddress(address: string): Promise<[number, number] | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
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

      const geocodePromises = querySnapshot.docs.map(async (docSnapshot) => {
        const producto = docSnapshot.data() as Producto;
        
        if (producto.agricultorId) {
          const agricultorDoc = doc(this.firestore, 'agricultores', producto.agricultorId);
          const agricultorSnapshot = await getDoc(agricultorDoc);
          
          if (agricultorSnapshot.exists()) {
            const agricultor = agricultorSnapshot.data() as Agricultor;
            const coordinates = await this.geocodeAddress(agricultor.address);
            
            const productWithLocation: ProductWithLocation = {
              producto,
              agricultor,
              coordinates: coordinates || undefined
            };
            return productWithLocation;
          }
        }
        return null;
      });

      const results = await Promise.all(geocodePromises);
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
}
