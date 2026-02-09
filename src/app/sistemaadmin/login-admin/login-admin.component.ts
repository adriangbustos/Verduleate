import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-login-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-admin.component.html',
  styleUrls: ['./login-admin.component.css']
})
export class LoginAdminComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  passwordVisible = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingService: LoadingService
  ) {}

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  goToLanding() {
    this.router.navigate(['/landing']);
  }

  async onSubmit() {
    this.errorMessage = '';
    
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, completa todos los campos.';
      return;
    }

    try {
      this.loadingService.show();
      
      // Sign in the admin user
      const user = await this.authService.signInAdmins(this.email, this.password);
      
      if (user) {
        this.router.navigate(['/admin/main']);
      }
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        this.errorMessage = 'Credenciales incorrectas.';
      } else if (error.message?.includes('Access denied')) {
        this.errorMessage = 'Acceso denegado. No eres un administrador.';
      } else {
        this.errorMessage = 'Error al iniciar sesión. Inténtalo de nuevo.';
      }
    } finally {
      this.loadingService.hide();
    }
  }
}
