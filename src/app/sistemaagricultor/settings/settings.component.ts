import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { Firestore, collection, deleteDoc, getDocs, query, where } from '@angular/fire/firestore'; // ✅ Corrección aquí

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
  error: any;

  constructor(
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService,
    private firestore: Firestore, // ✅ Corrección aquí (inyectando correctamente Firestore)
  ) { }

  showDialog() {
    this.visible = true;
  }

  async goToProfile() {
    this.router.navigate(['/profile-agricultor']);
  }

  async goHacienda() {
    this.router.navigate(['/hacienda']);
  }

  async onLogout() {
    try {
      const result: any = await this.authService.logout();
      if (result) {
        this.router.navigate(['/login-comprador']);
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cerrar la sesión.' });
      }
    } catch (error: any) {
      const cleanMessage = error.toString().replace(/^Error:\s*/, '');
      this.messageService.add({ severity: 'error', summary: 'Error', detail: cleanMessage });
    }
  }

  async deleteAccount() {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Usuario no autenticado' });
        return;
      }

      // Intentar eliminar la cuenta del usuario en Firebase Authentication primero
      const deleted = await this.authService.deleteUserAccount();
      if (!deleted) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la cuenta en Firebase Authentication. Asegúrate de haber iniciado sesión recientemente.' });
        return;
      }

      // Si la cuenta en Authentication se eliminó con éxito, proceder con Firestore
      const productosRef = collection(this.firestore, 'productos');
      const q = query(productosRef, where('agricultorId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      this.router.navigate(['/landing']);
    } catch (error) {
      const cleanMessage = this.error.toString().replace(/^Error:\s*/, '');
      this.messageService.add({ severity: 'error', summary: 'Error', detail: cleanMessage });
    }
  }
}
