import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import emailjs from '@emailjs/browser';


@Component({
  selector: 'app-landingpage',
  imports: [ToastModule, RouterModule, FormsModule],
  templateUrl: './landingpage.component.html',
  styleUrl: './landingpage.component.css',
  standalone: true,
  providers: [MessageService]
})
export class LandingpageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('globeContainer', { static: false }) globeContainer!: ElementRef;
  @ViewChild('heroCamionVideo', { static: false }) heroCamionVideo?: ElementRef<HTMLVideoElement>;
  private globeInstance: any;

  constructor(private router: Router, private messageService: MessageService) { }

  ngAfterViewInit() {
    this.setupScrollAnimations();
    this.setupParallaxEffect();
    this.initGlobe();
    this.forceMuteHeroVideo();
  }

  ngOnDestroy() {
    // Clean up globe renderer to prevent memory leaks
    if (this.globeInstance) {
      this.globeInstance.pauseAnimation();
      this.globeInstance.renderer()?.dispose();
    }
  }

  private forceMuteHeroVideo() {
    const video = this.heroCamionVideo?.nativeElement;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
  }

  private async initGlobe() {
    const Globe = (await import('globe.gl')).default;
    const THREE = await import('three');

    const containerEl = this.globeContainer.nativeElement as HTMLElement;

    const world = new Globe(containerEl, { animateIn: false })
      .globeImageUrl('assets/earth-blue-marble.png')
      .bumpImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png')
      .showAtmosphere(true)
      .atmosphereColor('rgba(255, 255, 255, 0.1)')
      .atmosphereAltitude(0.18);

    this.globeInstance = world;

    // Fit to container
    const { clientWidth, clientHeight } = containerEl;
    world.width(clientWidth);
    world.height(clientHeight);

    // Auto-rotate
    world.controls().autoRotate = false;
    world.controls().autoRotateSpeed = 0.35;
    world.controls().enableZoom = false;

    // Point camera at Ecuador (-1.8, -78.2)
    world.pointOfView({ lat: -1.8, lng: -78.2, altitude: 2.5 });

    // Shift globe upward so top edge aligns with top cards
    world.globeOffset([0, -110]);

    // Add clouds sphere
    const CLOUDS_ALT = 0.004;
    const CLOUDS_ROTATION_SPEED = -0.006; // deg/frame

    new THREE.TextureLoader().load('assets/clouds.png', (cloudsTexture: any) => {
      const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(world.getGlobeRadius() * (1 + CLOUDS_ALT), 75, 75),
        new THREE.MeshPhongMaterial({ map: cloudsTexture, transparent: true })
      );
      world.scene().add(clouds);

      (function rotateClouds() {
        clouds.rotation.y += CLOUDS_ROTATION_SPEED * Math.PI / 180;
        requestAnimationFrame(rotateClouds);
      })();
    });

    // Resize handler
    const resizeObserver = new ResizeObserver(() => {
      const { clientWidth: w, clientHeight: h } = containerEl;
      world.width(w);
      world.height(h);
    });
    resizeObserver.observe(containerEl);
  }

  setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    // Observe all elements with scroll-animate class
    const animatedElements = document.querySelectorAll('.scroll-animate');
    animatedElements.forEach(element => observer.observe(element));
  }

  setupParallaxEffect() {
    const background = document.querySelector('.reviews-video') as HTMLElement;
    const reviewsSection = document.querySelector('.reviews-section') as HTMLElement;
    
    if (!background || !reviewsSection) return;

    window.addEventListener('scroll', () => {
      const rect = reviewsSection.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate if section is in viewport
      if (rect.top < windowHeight && rect.bottom > 0) {
        // Calculate scroll progress through the section (0 to 1)
        const scrollProgress = Math.max(0, Math.min(1, 
          (windowHeight - rect.top) / (windowHeight + rect.height)
        ));
        
        // Scale from 1.1 to 1.3 based on scroll progress
        const scale = 1.1 + (scrollProgress * 0.2);
        background.style.transform = `scale(${scale})`;
      }
    });
  }

  newsletterEmail = '';

  goToCompradores() {
    this.router.navigate(['comprador/login-comprador']);
  }

  goToPricing() {
    this.router.navigate(['/pricing']);
  }

  goToAdministradores() {
    this.router.navigate(['admin/login']);
  } 

  goToAgricultores() {
    this.router.navigate(['agricultor/login-agricultor']);
  }

  @ViewChild('targetSection') targetSection!: ElementRef;
  @ViewChild('accountTypes') accountTypes!: ElementRef;

  scrollToSection(): void {
    if (this.targetSection) {
      this.targetSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToAccountTypes(): void {
    if (this.accountTypes) {
      this.accountTypes.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.split(' ');
    return parts.map(p => p.charAt(0).toUpperCase()).join('').substring(0, 2);
  }

  comments = [
    {
      text: "Excelente calidad y muy fresco. La entrega llegó antes de lo esperado.",
      author: "Sophia Bennett",
      rating: 5,
      image: "../../assets/LandingPage/ReviewsPFP/2.png"
    },
    {
      text: "Muy satisfecho con mi compra. Volvería a comprar sin dudar.",
      author: "James Carter",
      rating: 5,
      image: "../../assets/LandingPage/ReviewsPFP/1.png"
    },
    {
      text: "Buena calidad, aunque el envío tardó un poco más de lo esperado.",
      author: "Olivia Richardson",
      rating: 3,
      image: "../../assets/LandingPage/ReviewsPFP/3.png"
    },
    {
      text: "Todo llegó en perfecto estado y con gran sabor.",
      author: "Daniel Foster",
      rating: 5,
      image: "../../assets/LandingPage/ReviewsPFP/4.png"
    },
    {
      text: "Muy buena atencion y variedad. Recomiendo la plataforma.",
      author: "Ethan Hayes",
      rating: 5,
      image: "../../assets/LandingPage/ReviewsPFP/5.png"
    },
    {
      text: "Compras rapidas y seguras. El soporte respondio al instante.",
      author: "Emma Sullivan",
      rating: 4,
      image: "../../assets/LandingPage/ReviewsPFP/6.png"
    },
    {
      text: "Productos de temporada con excelente precio.",
      author: "Charlotte Reynolds",
      rating: 3,
      image: "../../assets/LandingPage/ReviewsPFP/7.png"
    },
    {
      text: "Me encanto la experiencia y la comunicacion.",
      author: "Lucas Mitchell",
      rating: 5,
      image: "../../assets/LandingPage/ReviewsPFP/8.png"
    },
    {
      text: "Entrega puntual y productos frescos. Excelente servicio.",
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
    phone: ''
  };

  sendEmail() {
    const serviceID = 'service_k9nwi8u';
    const templateID = 'template_6b35tk8';
    const publicKey = 'YQXyAyAu66MaWYCl1';
  
    // Validar que los campos del footer estén llenos
    if (!this.formData.user_name || !this.formData.phone) {
      this.messageService.add({ severity: 'warn', summary: 'Campos requeridos', detail: 'Por favor, completa todos los campos antes de enviar.' });
      return;
    }
  
    const emailData = {
      title: 'Solicitud de llamada',
      user_name: this.formData.user_name,
      phone: this.formData.phone,
      message: `Solicitud de llamada de ${this.formData.user_name} - Teléfono: ${this.formData.phone}`
    };
  
    emailjs.send(serviceID, templateID, emailData, publicKey)
      .then(() => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Solicitud enviada correctamente' });
        this.formData = {
          user_name: '',
          phone: ''
        };
      })
      .catch((error) => {
        console.error(error);
        this.messageService.add({ severity: 'error', summary: 'Hubo un problema', detail: 'Error al enviar la solicitud' });
      });
  }
  

}
