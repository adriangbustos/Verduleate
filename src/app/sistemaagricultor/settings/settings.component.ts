import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [DialogModule, ButtonModule, InputTextModule, ToastModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
  providers: [MessageService]
})
export class SettingsComponent {

  visible: boolean = false;

  showDialog() {
    this.visible = true;
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService,
  ) { }

  async goToProfile() {
    this.router.navigate(['/profile-agricultor']); // Redirige solo si el logout fue exitoso
  }
  async goHacienda() {
    this.router.navigate(['/hacienda']); // Redirige solo si el logout fue exitoso
  }

  async onLogout() {
    try {
      const result: any = await this.authService.logout(); // Cierra la sesión y obtiene el resultado
      if (result) { // Verifica si el resultado indica éxito
        this.router.navigate(['/login-comprador']); // Redirige solo si el logout fue exitoso
      } else {
        // Si el resultado no indica éxito, muestra un mensaje de error
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cerrar la sesión.' });
      }
    } catch (error: any) {
      const cleanMessage = error.toString().replace(/^Error:\s*/, ''); // Elimina "Error: " al inicio
      this.messageService.add({ severity: 'error', summary: 'Error', detail: cleanMessage });
    }
  }


  async deleteAccount() {
    try {
      const user = this.authService.getCurrentUser();
      await this.authService.deleteUserAccount();
      this.router.navigate(['/landing']); // Redirige después de eliminar la cuenta
    } catch (error: any) {
      const cleanMessage = error.toString().replace(/^Error:\s*/, ''); // Elimina "Error: " al inicio
      this.messageService.add({ severity: 'error', summary: 'Error', detail: cleanMessage });
    }
  }
}
