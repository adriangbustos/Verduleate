import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { ImageModule } from 'primeng/image';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';;
import { AuthService } from '../../services/auth.service';
import { DialogModule } from 'primeng/dialog';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-loginagricultor',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [InputTextModule, FormsModule, ToastModule, RippleModule, PasswordModule, FloatLabelModule, ReactiveFormsModule, DropdownModule, CheckboxModule, CommonModule, ImageModule, ButtonModule, DividerModule, DialogModule, ConfirmDialogModule],
  standalone: true,
  providers: [MessageService, ConfirmationService],
})
export class LoginComponent2 {

  visible: boolean = false;

  showDialog() {
    this.visible = true;
  }
  correo: string = '';
  isLoading: boolean = false;
  passwordVisible = false;  // Estado inicial para la visibilidad de la contraseña

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  goToHome() {
    this.router.navigate(['/landing']); // Navigates to the AboutComponent
  }
  goToSignUp() {
    this.router.navigate(['agricultor/signup-agricultor']); // Navigates to the AboutComponent
  }
  loginForm: FormGroup

  errorDialogVisible: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router, private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });


  }


  async recoverPassword() {
    try {
      console.log(this.correo)
      await this.authService.sendRecoveryEmailAgricultores(this.correo);
      this.messageService.add({ severity: 'success', summary: 'Enviado', detail: 'Revise su bandeja de entrada o spam ' });

    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ingrese correctamente el correo' });
    }
  }

  async login() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const email = this.loginForm.get('email')?.value;
      const password = this.loginForm.get('password')?.value;
      try {
        const user = await this.authService.signInAgricultores(email, password);
        if (user) {
          const userId = user.uid;
          console.log('UID del usuario autenticado:', userId);

          // Obtener los datos del usuario desde Firestore
          const userDoc = await this.authService.getAgricultorData(userId);
          console.log('Datos obtenidos de Firestore:', userDoc);

          if (userDoc?.['onboarding'] === false) {
            this.router.navigate(['agricultor/onboarding-agricultor']);
          } else {
            this.router.navigate(['agricultor/main-agricultor']);
          }
        }
      } catch (error: any) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Intente nuevamente, verifique credenciales y sistema.' });
        console.error('Error en el inicio de sesión:', error);
        this.isLoading = false;
      }
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Intente nuevamente, verifique credenciales y sistema.' });
      console.log('Formulario no válido');
      this.isLoading = false;
    }
  }

  async loginWithGoogle() {
    this.isLoading = true;

    const result = await this.authService.loginWithGoogleAgricultores();

    if (result.success) {
      console.log('Inicio de sesión exitoso');
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de inicio de sesión',
        detail: result.message
      });
    }

    this.isLoading = false;
  }


  touchedFields = { email: false };  // Para controlar si un campo ha sido tocado

  showError(field: 'email') {
    const emailControl = this.loginForm.get('email');
    let mensaje = '';

    // Si el campo es inválido y tocado, se muestra el mensaje general
    if (field === 'email' && emailControl?.invalid && this.touchedFields['email']) {
      mensaje = 'Por favor, asegúrese de que el correo sea válido.';
    }

    // Si hay un mensaje, se muestra con MessageService
    if (mensaje) {
      this.messageService.add({ severity: 'warn', summary: 'Precaución', detail: mensaje });
    }
  }

  // Marca el campo como tocado cuando se escribe en él
  checkTouched(field: 'email') {
    this.touchedFields[field] = true;
  }

}

