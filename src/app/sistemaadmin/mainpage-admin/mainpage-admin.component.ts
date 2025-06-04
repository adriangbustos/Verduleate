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
      productName: 'JavaScript Tutorial',
      productNumber: '85743',
      paymentStatus: 'Due',
      status: 'Pending'
    },
    {
      productName: 'CSS Full Course',
      productNumber: '97245',
      paymentStatus: 'Refunded',
      status: 'Declined'
    },
    {
      productName: 'Flex-Box Tutorial',
      productNumber: '36452',
      paymentStatus: 'Paid',
      status: 'Active'
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
      case 'Declined':
        return 'danger';
      case 'Pending':
        return 'warning';
      default:
        return 'primary';
    }
  }
}
