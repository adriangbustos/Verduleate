import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ImageModule } from 'primeng/image';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { RatingModule } from 'primeng/rating';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Timestamp } from 'firebase/firestore';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';
import { ChipModule } from 'primeng/chip';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DividerModule } from 'primeng/divider';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { Firestore, collection, addDoc, doc, getDoc } from '@angular/fire/firestore';


interface Provincia {
  state: string
}

interface Categoria {
  clase: string
}

interface Medida {
  peso: string
}

@Component({
  selector: 'app-register-products',
  standalone: true,
  imports: [ToastModule, CalendarModule, FormsModule, DropdownModule, ScrollPanelModule, TagModule, DividerModule, InputTextareaModule, InputTextModule, ChipModule, InputNumberModule, ReactiveFormsModule, DialogModule, ImageModule, CheckboxModule, ButtonModule, RatingModule, CommonModule],
  providers: [MessageService],
  templateUrl: './register-products.component.html',
  styleUrl: './register-products.component.css'
})
export class RegisterProductsComponent implements OnInit {
  registerProductForm: any;
  visible: boolean = false;
  visible2: boolean = false;

  showDialog() {
    this.visible = true;
  }

  showDialog2() {
    this.visible2 = true;
  }

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private firestore: Firestore,
    private authService: AuthService,
  ) {
    this.registerProductForm = this.fb.group({
      vegetal: ['', [Validators.required, Validators.minLength(4)]],
      provincia: ['', Validators.required],
      cantidadDisponible: [0, [Validators.required, Validators.min(1)]],
      descripcionCultivo: ['', [Validators.required, Validators.minLength(50)]],
      fechaCultivado: ['', Validators.required],
      categoria: ['', Validators.required],
      medida: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0.01)]],
    });
  }

  states: Provincia[] | undefined;
  clasificacion: Categoria[] | undefined;
  masa: Medida[] | undefined;

  ngOnInit() {
    this.states = [
      { state: 'Azuay' },
      { state: 'Bolívar' },
      { state: 'Cañar' },
      { state: 'Carchi' },
      { state: 'Chimborazo' },
      { state: 'Cotopaxi' },
      { state: 'El Oro' },
      { state: 'Esmeraldas' },
      { state: 'Galápagos' },
      { state: 'Guayas' },
      { state: 'Imbabura' },
      { state: 'Loja' },
      { state: 'Los Ríos' },
      { state: 'Manabí' },
      { state: 'Morona Santiago' },
      { state: 'Napo' },
      { state: 'Orellana' },
      { state: 'Pastaza' },
      { state: 'Pichincha' },
      { state: 'Santa Elena' },
      { state: 'Santo Domingo de los Tsáchilas' },
      { state: 'Sucumbíos' },
      { state: 'Tungurahua' },
      { state: 'Zamora Chinchipe' }
    ];

    this.clasificacion = [
      { clase: 'Hojas' },
      { clase: 'Hortalizas' },
      { clase: 'Tallos' },
      { clase: 'Raíces' },
      { clase: 'Tubérculos' },
      { clase: 'Bulbos' },
      { clase: 'Frutos' },
      { clase: 'Semillas' }
    ];

    this.masa = [
      { peso: 'kg' },
      { peso: 'lb' },
      { peso: 'g' },
      { peso: 'oz' },
    ];

    setTimeout(() => {
      this.messageService.add({ severity: 'info', summary: 'Registre su producto', detail: 'Llene todos los campos necesarios' });
    }, 100);

  }



  /* Animación de Guardado (Botón Guardar) */

  loading: boolean = false;

  abort() {
    this.router.navigate(['main-agricultor/productos'])
  }

  async load() {
    this.loading = true;
    try {
      const user = await this.authService.getCurrentUser();
      if (!user) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Usuario no autenticado' });
        this.loading = false;
        return;
      }

      const agricultorRef = doc(this.firestore, `agricultores/${user.uid}`);
      const agricultorSnap = await getDoc(agricultorRef);

      if (!agricultorSnap.exists()) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se encontró información del agricultor' });
        this.loading = false;
        return;
      }

      const agricultorData = agricultorSnap.data();
      const productData = {
        ...this.registerProductForm.value,
        agricultorId: user.uid,
        ValueTextArea: agricultorData?.['valueTextArea'] || '',
        fincaName: agricultorData?.['fincaname'] || ''
      };

      await addDoc(collection(this.firestore, 'productos'), productData);
      this.registerProductForm.reset();
      this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Su producto ha sido registrado' });

      setTimeout(() => {
        this.router.navigate(['main-agricultor/productos'])
      }, 2000);
    } catch (error) {
      console.error('Error al registrar producto:', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo registrar el producto' });
    } finally {
      this.loading = false;
    }
  }

  isFormValid(): boolean {
    return this.registerProductForm.valid;
  }
}

