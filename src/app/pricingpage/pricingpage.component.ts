import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface PlanFeature {
  icon: string;
  text: string;
}

interface Plan {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: PlanFeature[];
  cta: string;
  isFeatured?: boolean;
  badge?: string;
}

type AccountType = 'agricultor' | 'comprador';

@Component({
  selector: 'app-pricingpage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pricingpage.component.html',
  styleUrls: ['./pricingpage.component.css'],
})
export class PricingpageComponent {
  accountType: AccountType = 'agricultor';

  readonly plans: Record<AccountType, Plan[]> = {
    agricultor: [
      {
        name: 'Semilla',
        price: '$0',
        cadence: 'mes',
        description:
          'El inicio de tu transformación digital. Lo básico para probar el mercado sin riesgos.',
        features: [
          {
            icon: 'fa-solid fa-seedling',
            text: 'Inventario: Límite de hasta 5 productos activos simultáneamente.',
          },
          {
            icon: 'fa-solid fa-location-dot',
            text: 'Mapa Interactivo: Pin estándar (gris) sin diferenciación visual.',
          },
          {
            icon: 'fa-solid fa-percent',
            text: 'Comisión: 10% por cada venta en la plataforma + comisión de Stripe.',
          },
          {
            icon: 'fa-regular fa-circle-question',
            text: 'Soporte: Acceso a documentación y centro de ayuda.',
          },
        ],
        cta: 'Tu plan actual',
      },
      {
        name: 'Cosecha',
        price: '$19',
        cadence: 'mes',
        description: 'Para fincas que necesitan crecer, pero con limitaciones.',
        features: [
          {
            icon: 'fa-solid fa-warehouse',
            text: 'Inventario: Límite de hasta 15 productos activos.',
          },
          {
            icon: 'fa-solid fa-flag',
            text: 'Mapa Interactivo: Pin destacado con el logo de tu hacienda.',
          },
          {
            icon: 'fa-solid fa-hand-holding-dollar',
            text: 'Comisión: Reducida al 5% por venta + comisión de Stripe.',
          },
          {
            icon: 'fa-regular fa-envelope',
            text: 'Soporte: Respuesta prioritaria por correo electrónico (48h).',
          },
        ],
        cta: 'Actualizar a Cosecha',
      },
      {
        name: 'Agrónomo',
        price: '$29',
        cadence: 'mes',
        description:
          'Control total, cero comisiones y el poder de la Inteligencia Artificial.',
        features: [
          {
            icon: 'fa-solid fa-ranking-star',
            text: 'Posicionamiento VIP: Tu finca aparece siempre en el Top 3 de búsqueda y mapa.',
          },
          {
            icon: 'fa-solid fa-handshake',
            text: 'Comisión 0%: Te quedas con el 100% de tus ventas (pagas tarifa técnica de Stripe).',
          },
          {
            icon: 'fa-solid fa-robot',
            text: 'Agente IA de Mercado: Recomienda qué sembrar u ofrecer según demanda real.',
          },
          {
            icon: 'fa-solid fa-headset',
            text: 'Soporte ultra-rápido: Chat directo con administradores desde tu panel.',
          },
        ],
        cta: 'Actualizar a Agrónomo Pro',
        isFeatured: true,
        badge: 'Popular',
      },
      {
        name: 'Hacienda Plus',
        price: '$79',
        cadence: 'mes',
        description:
          'La vitrina más exclusiva para fincas de alto rendimiento.',
        features: [
          {
            icon: 'fa-solid fa-infinity',
            text: 'Inventario: Ilimitado. Publica todo tu catálogo sin restricciones.',
          },
          {
            icon: 'fa-solid fa-crown',
            text: 'Posicionamiento absoluto: Siempre #1 en resultados y mapa.',
          },
          {
            icon: 'fa-solid fa-chart-line',
            text: 'Panel ejecutivo con proyecciones de demanda y márgenes.',
          },
          {
            icon: 'fa-solid fa-truck-fast',
            text: 'Logística preferente: Prioridad en rutas y entregas.',
          },
          {
            icon: 'fa-solid fa-brain',
            text: 'IA avanzada: Predicción de precios y alertas de mercado.',
          },
          {
            icon: 'fa-solid fa-user-shield',
            text: 'Soporte 24/7 con ejecutivo dedicado.',
          },
        ],
        cta: 'Actualizar a Élite',
      },
    ],
    comprador: [
      {
        name: 'Básico',
        price: '$0',
        cadence: 'mes',
        description: 'Compra local cuando lo necesites.',
        features: [
          {
            icon: 'fa-solid fa-motorcycle',
            text: 'Envíos: Tarifa estándar calculada por distancia.',
          },
          {
            icon: 'fa-solid fa-basket-shopping',
            text: 'Acceso: Catálogo estándar de productos disponibles.',
          },
          {
            icon: 'fa-regular fa-credit-card',
            text: 'Compras: Gestión manual de carrito y pagos únicos.',
          },
        ],
        cta: 'Tu plan actual',
      },
      {
        name: 'Frecuente',
        price: '$19',
        cadence: 'mes',
        description: 'Para quienes compran semanalmente.',
        features: [
          {
            icon: 'fa-solid fa-tags',
            text: 'Envíos: 20% de descuento en todos los costos.',
          },
          {
            icon: 'fa-solid fa-clock',
            text: 'Acceso anticipado: Nuevas cosechas 6 horas antes.',
          },
          {
            icon: 'fa-solid fa-calendar-check',
            text: 'Suscripciones: Programa 1 Canasta Básica automática al mes.',
          },
        ],
        cta: 'Actualizar a Frecuente',
      },
      {
        name: 'Nutrición',
        price: '$29',
        cadence: 'mes',
        description: 'La maxima experiencia en salud y ahorro inteligente.',
        features: [
          {
            icon: 'fa-solid fa-truck',
            text: 'Envíos: GRATIS e ilimitados en pedidos sobre un monto mínimo.',
          },
          {
            icon: 'fa-solid fa-gem',
            text: 'Acceso VIP: Anticipo de 24 horas a productos exclusivos.',
          },
          {
            icon: 'fa-solid fa-apple-whole',
            text: 'Agente IA Nutricionista: Dietas personalizadas con stock cercano.',
          },
          {
            icon: 'fa-solid fa-box',
            text: 'Canastas inteligentes: Suscripciones automáticas ilimitadas.',
          },
        ],
        cta: 'Actualizar a Nutrición Premium',
        isFeatured: true,
        badge: 'Popular',
      },
      {
        name: 'Gourmet',
        price: '$79',
        cadence: 'mes',
        description: 'La experiencia definitiva en bienestar y ahorro total.',
        features: [
          {
            icon: 'fa-solid fa-crown',
            text: 'Acceso absoluto: Prioridad en productos de edición limitada.',
          },
          {
            icon: 'fa-solid fa-stethoscope',
            text: 'IA nutricional pro: Planes semanales con metas y macros.',
          },
          {
            icon: 'fa-solid fa-person-walking',
            text: 'Recojo inteligente: Rutas optimizadas y alertas de horario.',
          },
          {
            icon: 'fa-solid fa-credit-card',
            text: 'Pagos flexibles: Divide compras grandes sin recargos.',
          },
          {
            icon: 'fa-solid fa-headset',
            text: 'Soporte 24/7 con asesor personal de compras.',
          },
        ],
        cta: 'Actualizar a Élite',
      },
    ],
  };

  constructor(private router: Router) {}

  setAccountType(type: AccountType) {
    this.accountType = type;
  }

  get activePlans(): Plan[] {
    return this.plans[this.accountType];
  }

  goToHome() {
    this.router.navigate(['/landing']);
  }
}
