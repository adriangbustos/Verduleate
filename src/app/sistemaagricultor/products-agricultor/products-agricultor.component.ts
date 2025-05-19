import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MenuItem, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { deleteDoc, updateDoc } from 'firebase/firestore';
import { Firestore, collection, query, where, collectionData, getDoc, doc } from '@angular/fire/firestore';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-products-agricultor',
  standalone: true,
  imports: [ToastModule, ButtonModule, PaginatorModule, FormsModule, RatingModule, DialogModule, ScrollPanelModule, CommonModule, CardModule],
  providers: [MessageService],
  templateUrl: './products-agricultor.component.html',
  styleUrl: './products-agricultor.component.css'
})
export class ProductsAgricultorComponent implements OnInit {
  displayModal = false;
  selectedProduct: any;
  agricultorData: any = null;

  datauser: any;
  products = signal<any[]>([]);
  loading = signal(true);

  editNameModal = false;
  confirmDeleteModal = false;
  nameToEdit: string = '';
  productToEditOrDelete: any = null;

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
  onSearchChange() {
    this.first = 0; // Reiniciar paginación al principio
    this.updateVisibleProducts();
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
          const formatted = data.map((product: any) => ({
            ...product,
            formattedVegetal: this.formatVegetal(product.Vegetal)
          }));

          // ORDEN ALFABÉTICO por 'Vegetal'
          formatted.sort((a, b) => a.Vegetal.localeCompare(b.Vegetal));

          this.allProducts = formatted;
          this.updateVisibleProducts();
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

  // Método para limpiar y formatear el nombre del Vegetal
  formatVegetal(name: string): string {
    if (!name) return '';
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, '');
  }

  registerProduct() {
    this.router.navigate(['agricultor/main-agricultor/register-product']);
  }

  async getAgricultorById(agricultorId: string): Promise<any | null> {
    try {
      const agricultorRef = doc(this.firestore, 'agricultores', agricultorId);
      const agricultorSnap = await getDoc(agricultorRef);

      if (agricultorSnap.exists()) {
        return agricultorSnap.data();
      } else {
        console.warn(`No se encontró agricultor con ID: ${agricultorId}`);
        return null;
      }
    } catch (error) {
      console.error('Error obteniendo datos del agricultor:', error);
      return null;
    }
  }

  openModal(product: any) {
    this.selectedProduct = product;
    this.displayModal = true;

    if (product.agricultorId) {
      this.getAgricultorById(product.agricultorId).then(data => {
        this.agricultorData = data;
      });
    } else {
      this.agricultorData = null;
    }
  }

  value!: number;

  allProducts: any[] = [];  // Todos los productos
  rows = 10;                // Productos por página
  first = 0;                // Índice del primer producto visible

  searchTerm: string = '';

  onPageChange(event: any) {
    this.first = event.first;
    this.updateVisibleProducts();
  }

  updateVisibleProducts() {
    const filtered = this.allProducts.filter(p =>
      p.Vegetal.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    const pagedProducts = filtered.slice(this.first, this.first + this.rows);
    this.products.set(pagedProducts);
  }

  openEditNameModal(product: any) {
    this.displayModal = false;
    this.productToEditOrDelete = product;
    this.nameToEdit = product.Vegetal;
    this.editNameModal = true;
  }

  openConfirmDeleteModal(product: any) {
    this.displayModal = false;
    this.productToEditOrDelete = product;
    this.confirmDeleteModal = true;
  }

  async saveNewName() {
    if (!this.nameToEdit.trim()) return;

    try {
      const ref = doc(this.firestore, 'productos', this.productToEditOrDelete.productId);
      await updateDoc(ref, { Vegetal: this.nameToEdit.trim() });

      this.messageService.add({
        severity: 'success',
        summary: 'Nombre actualizado',
        detail: 'El producto fue renombrado correctamente.'
      });
    } catch (error) {
      console.error('Error al cambiar nombre:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo actualizar el nombre.'
      });
    }

    this.editNameModal = false;
    this.productToEditOrDelete = null;
  }

  async confirmDeleteProduct() {
    try {
      const ref = doc(this.firestore, 'productos', this.productToEditOrDelete.productId);
      await deleteDoc(ref);

      this.messageService.add({
        severity: 'success',
        summary: 'Producto eliminado',
        detail: 'El producto fue eliminado correctamente.'
      });
    } catch (error) {
      console.error('Error al eliminar:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo eliminar el producto.'
      });
    }

    this.confirmDeleteModal = false;
    this.productToEditOrDelete = null;
  }
}

