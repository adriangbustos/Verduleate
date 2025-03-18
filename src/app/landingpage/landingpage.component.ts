import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { ImageModule } from 'primeng/image';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { SplitterModule } from 'primeng/splitter';   
import { CarouselModule } from 'primeng/carousel';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { Router } from '@angular/router';

interface Account {
  name: string;
  code: string;
}

@Component({
  selector: 'app-landingpage',
  imports: [ImageModule, ButtonModule, FormsModule, RatingModule, DropdownModule, CarouselModule, RippleModule, DividerModule, InputTextModule, SplitterModule],
  templateUrl: './landingpage.component.html',
  styleUrl: './landingpage.component.css',
  standalone: true,
})
export class LandingpageComponent implements OnInit {
  
  constructor(private router: Router) {}
  
  goToCompradores() {
    this.router.navigate(['/login-comprador']); // Navigates to the AboutComponent
  }
  goToAgricultores() {
    this.router.navigate(['/login-agricultor']); // Navigates to the AboutComponent
  }

  @ViewChild('targetSection') targetSection!: ElementRef;

  scrollToSection(): void {
    if (this.targetSection) {
      this.targetSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
  accounts: Account[] | undefined;

  selectedAccount: Account | undefined;

  ngOnInit() {
    this.accounts = [
      { name: 'Agricultor', code: 'AGR' },
      { name: 'Comprador', code: 'COM' },
    ];
  }

  comments = [
    {
      text: "¡Este producto es increíble! Muy recomendado.",
      author: "Sophia Bennett",
      rating: 5,
      image: "https://github.com/ElAdripan/Verduleate/blob/main/Review%20PFP/2.png?raw=true"
    },
    {
      text: "Excelente servicio y entrega rápida. ¡5 estrellas!",
      author: "James Carter",
      rating: 4,
      image: "https://github.com/ElAdripan/Verduleate/blob/main/Review%20PFP/1.png?raw=true"
    },
    {
      text: "Buena calidad, pero el envío tardó un poco más de lo esperado.",
      author: "Olivia Richardson",
      rating: 3,
      image: "https://github.com/ElAdripan/Verduleate/blob/main/Review%20PFP/3.png?raw=true"
    },
    {
      text: "Muy satisfecho con mi compra. ¡Volvería a comprar!",
      author: "Daniel Foster",
      rating: 5,
      image: "https://github.com/ElAdripan/Verduleate/blob/main/Review%20PFP/4.png?raw=true"
    },
    {
      text: "¡Este producto es increíble! Muy recomendado.",
      author: "Ethan Hayes",
      rating: 5,
      image: "https://github.com/ElAdripan/Verduleate/blob/main/Review%20PFP/5.png?raw=true"
    },
    {
      text: "Excelente servicio y entrega rápida. ¡5 estrellas!",
      author: "Emma Sullivan",
      rating: 4,
      image: "https://github.com/ElAdripan/Verduleate/blob/main/Review%20PFP/6.png?raw=true"
    },
    {
      text: "Buena calidad, pero el envío tardó un poco más de lo esperado.",
      author: "Charlotte Reynolds",
      rating: 3,
      image: "https://github.com/ElAdripan/Verduleate/blob/main/Review%20PFP/7.png?raw=true"
    },
    {
      text: "Muy satisfecho con mi compra. ¡Volvería a comprar!",
      author: "Lucas Mitchell",
      rating: 5,
      image: "https://github.com/ElAdripan/Verduleate/blob/main/Review%20PFP/8.png?raw=true"
    },
    {
      text: "Muy satisfecha con mi compra. ¡Volvería a comprar!",
      author: "Amelia Scott",
      rating: 5,
      image: "https://github.com/ElAdripan/Verduleate/blob/main/Review%20PFP/9.png?raw=true"
    }
];

}
