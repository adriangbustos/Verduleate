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

@Component({
  selector: 'app-hacienda',
  standalone: true,
  imports: [ToastModule, FormsModule, CommonModule, InputMaskModule, DialogModule],
  templateUrl: './hacienda.component.html',
  styleUrl: './hacienda.component.css',
  providers: [{ provide: LOCALE_ID, useValue: 'es-ES' }, MessageService]
})
export class HaciendaComponent implements OnInit {
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

  async getData() {
    let data = this.authService.getCurrentUser();
    let id = data?.uid ?? '';
    let result = await this.authService.getDocument('agricultores', id);
    this.datauser = result;
  }

  async onLogout() {
    try {
      const result: any = await this.authService.logout();
      console.log(result);

      if (result) {
        this.router.navigate(['/landing']);
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cerrar la sesión.' });
        this.cdRef.detectChanges();
      }
    } catch (error) {
      console.error("Error en logout:", error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cerrar la sesión.' });
      this.cdRef.detectChanges();
    }
  }
  openEditDialog(field: string) {
    this.displayDialog = true;
    this.editingField = field;
    this.editableData[field] = this.datauser[field]; // Copia el valor actual
  }


  async updateUserData() {
    this.displayDialog = false;
    if (!this.editingField) return;

    if (this.editingField === 'valueTextArea') {
      const wordCount = this.editableData.valueTextArea.trim().split(/\s+/).length;
      if (wordCount < 20) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'La descripción debe tener al menos 20 palabras.' });
        return;
      }
    }

    let data = this.authService.getCurrentUser();
    let id = data?.uid ?? '';

    try {
      const userRef = doc(this.firestore, 'agricultores', id);
      await updateDoc(userRef, { [this.editingField]: this.editableData[this.editingField] });

      this.datauser[this.editingField] = this.editableData[this.editingField];
      this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Información actualizada correctamente' });
    } catch (error) {
      console.error('Error al actualizar datos:', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar la información' });
    }
  }

}
