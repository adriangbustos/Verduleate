import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ViewChild, ElementRef } from '@angular/core';
import { Component, OnInit, signal } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
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
  imports: [ScrollPanelModule, ScrollTopModule, FormsModule, CarouselModule, CardModule, DialogModule, RatingModule, ToastModule, MenuModule, ButtonModule, CommonModule],
  templateUrl: './mainpage.component.html',
  styleUrl: './mainpage.component.css',
  providers: [MessageService]
})
export class MainpageComponent implements OnInit {

  @ViewChild('menuContainer', { read: ElementRef })
  menuContainer!: ElementRef;

  goToHome() {
    this.router.navigate(['comprador/main-comprador']); // Navigates to the AboutComponent
  }

  menuItems: MenuItem[] = [];

  ngOnInit() {
    this.menuItems = [
      { label: 'Profile', icon: 'fas fa-user', command: () => this.goToProfile() },
      { label: 'Settings', icon: 'fas fa-cog', command: () => this.openSettings() },
      { label: 'Logout', icon: 'fas fa-sign-out-alt', command: () => this.logout() }
    ];

    this.cargarProductosDeGuayas();

  }
  productosGuayas: any[] = [];

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


  async cargarProductosDeGuayas() {
    const productosRef = collection(this.firestore, 'productos');
    const q = query(productosRef, where('provincia.state', '==', 'Carchi'));

    collectionData(q, { idField: 'id' }).subscribe((productos) => {
      this.productosGuayas = productos.map((product: any) => ({
        ...product,
        formattedVegetal: this.formatVegetal(product.Vegetal)
      }));

      console.log('Productos en Guayas:', this.productosGuayas);
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
}





