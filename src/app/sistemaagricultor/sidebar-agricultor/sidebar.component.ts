import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SessionService } from '../../services/session.service';
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
export class SidebarComponent implements OnInit {

  userData: any = null;
  isLoadingSession: boolean = true;

  constructor(
    private authService: AuthService, 
    private sessionService: SessionService,
    private router: Router, 
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.restoreUserSession();
  }

  async restoreUserSession() {
    try {
      this.isLoadingSession = true;
      
      // Verificar si el usuario está autenticado
      const isAuthenticated = await this.authService.isAuthenticatedPromise();
      
      if (!isAuthenticated) {
        console.log('No hay sesión activa');
        this.router.navigate(['/agricultor/login-agricultor']);
        return;
      }

      // Obtener el usuario actual
      const currentUser = this.authService.getCurrentUser();
      
      if (!currentUser) {
        console.log('No se pudo obtener el usuario actual');
        this.router.navigate(['/agricultor/login-agricultor']);
        return;
      }

      // Obtener los datos del agricultor desde Firestore
      const agricultorData = await this.authService.getAgricultorData(currentUser.uid);
      
      if (agricultorData) {
        this.userData = {
          uid: currentUser.uid,
          email: currentUser.email,
          ...agricultorData
        };
        
        // Guardar en el servicio de sesión
        this.sessionService.setSession({
          uid: currentUser.uid,
          email: currentUser.email,
          userData: agricultorData,
          userType: 'agricultor'
        });
        
        console.log('Sesión de usuario restaurada exitosamente:', this.userData);
        
        // Verificar si debe completar el onboarding
        if (agricultorData['onboarding'] === false) {
          console.log('Usuario debe completar onboarding');
          this.router.navigate(['/agricultor/onboarding-agricultor']);
        }
      } else {
        console.log('No se encontraron datos del agricultor en Firestore');
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se encontraron datos del usuario'
        });
        await this.clearSessionAndRedirect();
      }
      
    } catch (error) {
      console.error('Error al restaurar la sesión:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar la sesión del usuario'
      });
      await this.clearSessionAndRedirect();
    } finally {
      this.isLoadingSession = false;
    }
  }

  async clearSessionAndRedirect() {
    try {
      await this.authService.logout();
      this.sessionService.clearSession();
      this.userData = null;
      this.router.navigate(['/agricultor/login-agricultor']);
    } catch (error) {
      console.error('Error al limpiar la sesión:', error);
      this.router.navigate(['/agricultor/login-agricultor']);
    }
  }

  goToProductos() {
    this.router.navigate(['agricultor/main-agricultor/productos']);
  }

  goToSettings() {
    this.router.navigate(['agricultor/main-agricultor/settings']);
  }

  goToSupport() {
    this.router.navigate(['agricultor/main-agricultor/support']);
  }

}
