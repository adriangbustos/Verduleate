import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { Firestore, collection, query, where, collectionData } from '@angular/fire/firestore';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-products-agricultor',
  standalone: true,
  imports: [ToastModule, DialogModule, CommonModule, CardModule],
  providers: [MessageService],
  templateUrl: './products-agricultor.component.html',
  styleUrl: './products-agricultor.component.css'
})
export class ProductsAgricultorComponent implements OnInit {
  displayModal = false;
  selectedProduct: any;

  openModal(product: any) {
    this.selectedProduct = product;
    this.displayModal = true;
  }
  datauser: any;
  products = signal<any[]>([]);
  loading = signal(true);

  constructor(
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService,
    private firestore: Firestore
  ) { }

  ngOnInit() {
    this.getData();
    this.loadProducts();
  }

  async getData() {
    let data = this.authService.getCurrentUser();
    let id = data?.uid ?? '';
    let result = await this.authService.getDocument('agricultores', id);
    this.datauser = result;
  }

  loadProducts() {
    let data = this.authService.getCurrentUser();
    let id = data?.uid ?? '';
    const currentAgricultorId = id;
  
    if (currentAgricultorId) {
      const productsCollection = collection(this.firestore, 'productos');
      const q = query(productsCollection, where('agricultorId', '==', currentAgricultorId));
  
      collectionData(q).subscribe({
        next: (data) => {
          console.log('Productos obtenidos:', data);
          
          // Procesamos cada producto para generar su imagen formateada
          const updatedProducts = data.map((product: any) => ({
            ...product,
            formattedVegetal: this.formatVegetal(product.vegetal)
          }));
  
          this.products.set(updatedProducts);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error obteniendo productos:', err);
          this.loading.set(false);
        },
      });
    } else {
      console.error('No se encontró agricultorId en el usuario');
      this.loading.set(false);
    }
  }

  // Método para limpiar y formatear el nombre del vegetal
  formatVegetal(name: string): string {
    if (!name) return ''; // Previene errores si es null o undefined
    return name
      .normalize("NFD") // Descompone los caracteres acentuados en su forma base + tilde
      .replace(/[\u0300-\u036f]/g, '') // Elimina los signos diacríticos (tildes)
      .toLowerCase()
      .replace(/\s+/g, '');
  }

  registerProduct() {
    this.router.navigate(['agricultor/main-agricultor/register-product']);
  }
}
