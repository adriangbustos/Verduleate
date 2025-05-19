import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { ImageModule } from 'primeng/image';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';  // Asegúrate de importar RouterModule
import { DropdownModule } from 'primeng/dropdown';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { SplitterModule } from 'primeng/splitter';
import { CarouselModule } from 'primeng/carousel';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import emailjs from '@emailjs/browser';


@Component({
  selector: 'app-landingpage',
  imports: [ImageModule, ToastModule, RouterModule, ButtonModule, FormsModule, RatingModule, DropdownModule, CarouselModule, RippleModule, DividerModule, InputTextModule, SplitterModule],
  templateUrl: './landingpage.component.html',
  styleUrl: './landingpage.component.css',
  standalone: true,
  providers: [MessageService]
})
export class LandingpageComponent {

  constructor(private router: Router, private messageService: MessageService) { }

  goToCompradores() {
    this.router.navigate(['comprador/login-comprador']); // Navigates to the AboutComponent
  }
  goToAgricultores() {
    this.router.navigate(['agricultor/login-agricultor']); // Navigates to the AboutComponent
  }

  @ViewChild('targetSection') targetSection!: ElementRef;

  scrollToSection(): void {
    if (this.targetSection) {
      this.targetSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
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

  accounts = [
    { name: 'Comprador' },
    { name: 'Agricultor' }
  ];

  formData = {
    user_name: '',
    user_email: '',
    phone: '',
    tipo_cuenta: null as { name: string } | null,
    message: '',
    title: ''
  };

  sendEmail() {
    const serviceID = 'service_k9nwi8u';
    const templateID = 'template_6b35tk8';
    const publicKey = 'YQXyAyAu66MaWYCl1';
  
    // Asegúrate de que tipo_cuenta sea un objeto antes de intentar acceder a 'name'
    const tipoCuentaName = this.formData.tipo_cuenta && this.formData.tipo_cuenta.name ? this.formData.tipo_cuenta.name : '';
  
    // Validar que todos los campos estén llenos
    if (
      !this.formData.title ||
      !this.formData.user_name ||
      !this.formData.user_email ||
      !this.formData.phone ||
      !tipoCuentaName ||
      !this.formData.message
    ) {
      this.messageService.add({ severity: 'warn', summary: 'Campos requeridos', detail: 'Por favor, completa todos los campos antes de enviar el correo.' });
      return;
    }
  
    // Crear un objeto con solo los valores que necesitas
    const emailData = {
      title: this.formData.title,
      user_name: this.formData.user_name,
      user_email: this.formData.user_email,
      phone: this.formData.phone,
      tipo_cuenta: tipoCuentaName,  // Solo el nombre
      message: this.formData.message
    };
  
    // Enviar el correo con emailjs
    emailjs.send(serviceID, templateID, emailData, publicKey)
      .then(() => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Correo enviado correctamente' });
        this.formData = {
          title: '',
          user_name: '',
          user_email: '',
          phone: '',
          tipo_cuenta: null,
          message: ''
        };
      })
      .catch((error) => {
        console.error(error);
        this.messageService.add({ severity: 'error', summary: 'Hubo un problema', detail: 'Error al enviar el correo' });
      });
  }
  

}
