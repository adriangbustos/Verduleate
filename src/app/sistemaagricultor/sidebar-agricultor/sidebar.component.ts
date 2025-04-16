import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';


@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService]
})
export class SidebarComponent {

  goToProductos() {
    this.router.navigate(['agricultor/main-agricultor/productos']); // Navigates to the AboutComponent
  }

  goToSettings() {
    this.router.navigate(['agricultor/main-agricultor/settings']); // Navigates to the AboutComponent
  }

  goToSupport() {
    this.router.navigate(['agricultor/main-agricultor/support']); // Navigates to the AboutComponent
  }


  constructor(private authService: AuthService, private router: Router, private messageService: MessageService) { }



}
