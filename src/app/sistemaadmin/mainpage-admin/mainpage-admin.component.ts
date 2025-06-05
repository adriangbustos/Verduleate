import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Order {
  productName: string;
  productNumber: string;
  paymentStatus: string;
  status: string;
}

@Component({
  selector: 'app-mainpage-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mainpage-admin.component.html',
  styleUrls: ['./mainpage-admin.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MainPageAdminComponent implements OnInit {
  orders: Order[] = [
    {
      productName: 'Tutorial de JavaScript',
      productNumber: '85743',
      paymentStatus: 'Pendiente',
      status: 'Pendiente'
    },
    {
      productName: 'Curso Completo de CSS',
      productNumber: '97245',
      paymentStatus: 'Reembolsado',
      status: 'Rechazado'
    },
    {
      productName: 'Tutorial de Flex-Box',
      productNumber: '36452',
      paymentStatus: 'Pagado',
      status: 'Activo'
    }
  ];

  ngOnInit() {
    this.initializeDOMElements();
  }

  private initializeDOMElements(): void {
    const sideMenu = document.querySelector('aside');
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-btn');
    const darkMode = document.querySelector('.dark-mode');

    if (menuBtn && sideMenu) {
      menuBtn.addEventListener('click', () => {
        if (sideMenu instanceof HTMLElement) {
          sideMenu.style.display = 'block';
        }
      });
    }

    if (closeBtn && sideMenu) {
      closeBtn.addEventListener('click', () => {
        if (sideMenu instanceof HTMLElement) {
          sideMenu.style.display = 'none';
        }
      });
    }

    if (darkMode) {
      darkMode.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode-variables');
        const spans = darkMode.querySelectorAll('span');
        spans.forEach(span => span.classList.toggle('active'));
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Rechazado':
        return 'danger';
      case 'Pendiente':
        return 'warning';
      default:
        return 'primary';
    }
  }
}
