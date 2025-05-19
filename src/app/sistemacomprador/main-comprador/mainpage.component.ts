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
  constructor(private router: Router, private authService: AuthService) {

  }

  comments = [
    {
      text: "¡Este producto es increíble! Muy recomendado.",
      author: "Sophia Bennett",
      rating: 5,
      image: "../../assets/LandingPage/ReviewsPFP/2.png"
    },
    {
      text: "Excelente servicio y entrega rápida. ¡5 estrellas!",
      author: "James Carter",
      rating: 4,
      image: "../../assets/LandingPage/ReviewsPFP/1.png"
    },
    {
      text: "Buena calidad, pero el envío tardó un poco más de lo esperado.",
      author: "Olivia Richardson",
      rating: 3,
      image: "../../assets/LandingPage/ReviewsPFP/3.png"
    },
    {
      text: "Muy satisfecho con mi compra. ¡Volvería a comprar!",
      author: "Daniel Foster",
      rating: 5,
      image: "../../assets/LandingPage/ReviewsPFP/4.png"
    },
    {
      text: "¡Este producto es increíble! Muy recomendado.",
      author: "Ethan Hayes",
      rating: 5,
      image: "../../assets/LandingPage/ReviewsPFP/5.png"
    },
    {
      text: "Excelente servicio y entrega rápida. ¡5 estrellas!",
      author: "Emma Sullivan",
      rating: 4,
      image: "../../assets/LandingPage/ReviewsPFP/6.png"
    },
    {
      text: "Buena calidad, pero el envío tardó un poco más de lo esperado.",
      author: "Charlotte Reynolds",
      rating: 3,
      image: "../../assets/LandingPage/ReviewsPFP/7.png"
    },
    {
      text: "Muy satisfecho con mi compra. ¡Volvería a comprar!",
      author: "Lucas Mitchell",
      rating: 5,
      image: "../../assets/LandingPage/ReviewsPFP/8.png"
    },
    {
      text: "Muy satisfecha con mi compra. ¡Volvería a comprar!",
      author: "Amelia Scott",
      rating: 5,
      image: "../../assets/LandingPage/ReviewsPFP/9.png"
    }
  ];

}

