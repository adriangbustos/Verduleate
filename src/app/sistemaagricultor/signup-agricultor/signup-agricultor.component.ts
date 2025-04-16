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
import { sendEmailVerification } from 'firebase/auth';

@Component({
  selector: 'app-signupagricultor',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  imports: [InputTextModule, FormsModule, ToastModule, RippleModule, PasswordModule, FloatLabelModule, ReactiveFormsModule, DropdownModule, CheckboxModule, CommonModule, ImageModule, ButtonModule, DividerModule, DialogModule],
  standalone: true,
  providers: [MessageService],
})
export class SignupComponent2 implements OnInit {
  isLoading: boolean = false;
  displaySuccessDialog: boolean = false;
  errorMessage: string = '';
  signUpForm: FormGroup;
  userCredential: any;

  goToHome() {
    this.router.navigate(['/landing']); // Navigates to the AboutComponent
  }

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private messageService: MessageService) {

    this.signUpForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async submit() {
    if (this.signUpForm.valid) {
      this.isLoading = true;

      try {
        // Crear el usuario y obtener el objeto completo
        const userCredential = await this.authService.signUp(
          this.signUpForm.value.email,
          this.signUpForm.value.password
        );

        if (!userCredential || !userCredential.user) {
          throw new Error('Error en la autenticación: No se obtuvo el usuario');
        }

        const user = userCredential.user;

        // Enviar el correo de verificación
        await sendEmailVerification(user);
        console.log('Correo de verificación enviado.');
        this.messageService.add({ severity: 'info', summary: 'Revise su correo', detail: 'Allí hallará un mail para verificar su mail' });

        // Hacer polling para verificar si el correo ha sido verificado
        let emailVerified = false;
        while (!emailVerified) {
          // Espera de 3 segundos entre cada comprobación
          await new Promise(resolve => setTimeout(resolve, 5000));
          await user.reload(); // Recarga el estado del usuario
          emailVerified = user.emailVerified; // Verifica si el correo está verificado
          console.log(`Estado de verificación: ${emailVerified}`);
        }

        // Ahora que el email está verificado, crear el documento
        await this.authService.createDocument('agricultores', user.uid, {
          email: user.email,
          uid: user.uid,
          onboarding: false,
          emailverificado: true,
        });

        this.router.navigate(['agricultor/onboarding-agricultor']);
        this.isLoading = false;

      } catch (error: any) {
        this.isLoading = false;
        console.error(error.message);
        this.handleAuthError(error.code);
      }
    } else {
      console.log('Formulario inválido');
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

  private handleAuthError(errorCode: string) {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Este correo ya está en uso. Intenta con otro. Sugerimos crear un mail explícitamente para su hacienda.' });
        break;
      default:
        this.errorMessage = 'Ocurrió un error. Por favor, intenta nuevamente.';
        break;
    }
  }


  passwordVisible = false;  // Estado inicial para la visibilidad de la contraseña
  touchedFields = { email: false, password: false };  // Para controlar si un campo ha sido tocado

  ngOnInit() {
    // Inicia cualquier lógica adicional aquí si es necesario.
  }

  // Función para alternar entre mostrar y ocultar la contraseña
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  // Verifica si el campo ha sido tocado y si está inválido al perder el foco
  showError(field: 'email' | 'password') {
    const emailControl = this.signUpForm.get('email');
    const passwordControl = this.signUpForm.get('password');
    let mensaje = '';

    // Si el campo es inválido y tocado, se muestra el mensaje general
    if (field === 'email' && emailControl?.invalid && this.touchedFields['email']) {
      mensaje = 'Por favor, asegúrese de que el correo sea válido.';
    } else if (field === 'password' && passwordControl?.invalid && this.touchedFields['password']) {
      mensaje = 'La contraseña debe tener al menos 6 caracteres.';
    }

    // Si hay un mensaje, se muestra con MessageService
    if (mensaje) {
      this.messageService.add({ severity: 'warn', summary: 'Precaución', detail: mensaje });
    }
  }

  // Marca el campo como tocado cuando se escribe en él
  checkTouched(field: 'email' | 'password') {
    this.touchedFields[field] = true;
  }

}

