import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { FormsModule } from '@angular/forms';  // <-- IMPORTA ESTO
import { DatePipe } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';
import { EmailAuthProvider, getAuth, reauthenticateWithCredential, sendEmailVerification, updateEmail } from 'firebase/auth';
import { DialogModule } from 'primeng/dialog';
import { InputMaskModule } from 'primeng/inputmask';
import { ChangeDetectorRef } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton'

registerLocaleData(localeEs);  // 📌 Registra el idioma español

@Component({
  selector: 'app-profile-agricultor',
  standalone: true,
  imports: [DatePipe, ToastModule, FormsModule, CommonModule, InputMaskModule, DialogModule, SkeletonModule],
  templateUrl: './profile-agricultor.component.html',
  styleUrl: './profile-agricultor.component.css',
  providers: [{ provide: LOCALE_ID, useValue: 'es-ES' }, MessageService]
})
export class ProfileAgricultorComponent implements OnInit {


  constructor(
    private authService: AuthService,
    private router: Router,
    private firestore: Firestore,
    private messageService: MessageService,
    private cdRef: ChangeDetectorRef // 🔥 Inyecta ChangeDetectorRef
  ) { }


  ngOnInit() {
    this.getData()
  }

  datauser: any = {};
  editableData: any = {};
  displayDialog: boolean = false;
  editingField: string = '';
  isLoading: boolean = false;
  isLoading2: boolean = false;

  async getData() {
    let data = this.authService.getCurrentUser();
    let id = data?.uid ?? '';
    let result = await this.authService.getDocument('agricultores', id);
    this.datauser = result;
  }

  async onLogout() {
    try {
      this.isLoading2 = true;

      await this.authService.logout();

      // Espera 1 segundo
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.isLoading2 = false;
      this.router.navigate(['agricultor/login-agricultor']);

    } catch (error: any) {
      this.isLoading2 = false;
      const cleanMessage = error.toString().replace(/^Error:\s*/, '');
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: cleanMessage
      });
    }
  }

  openEditDialog(field: string) {
    this.displayDialog = true;
    this.editingField = field;
    this.editableData[field] = this.datauser[field]; // Copia el valor actual
  }

  async updateUserData() {
    if (!this.editingField) return;
    let data = this.authService.getCurrentUser();
    let id = data?.uid ?? '';

    try {
      // Actualizar en Firestore
      this.displayDialog = false;
      this.isLoading = true
      const userRef = doc(this.firestore, 'agricultores', id);
      await updateDoc(userRef, { [this.editingField]: this.editableData[this.editingField] });

      this.datauser[this.editingField] = this.editableData[this.editingField];
      this.isLoading = false;
      this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Información actualizada correctamente' });
    } catch (error) {
      console.error('Error al actualizar datos:', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar la información' });
    }
  }

}
