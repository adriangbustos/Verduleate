import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ImageModule } from 'primeng/image';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { RatingModule } from 'primeng/rating';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { CalendarModule } from 'primeng/calendar';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Timestamp } from 'firebase/firestore';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputMaskModule } from 'primeng/inputmask';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ChipModule } from 'primeng/chip';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DividerModule } from 'primeng/divider';


interface states {
  states: string;
}

@Component({
  selector: 'app-products-agricultor',
  standalone: true,
  imports: [ToastModule, ScrollPanelModule, DropdownModule, TagModule, DividerModule, InputMaskModule, FormsModule, InputTextareaModule, InputTextModule, ChipModule, InputNumberModule, ReactiveFormsModule, DialogModule, ImageModule, CheckboxModule, ButtonModule, RatingModule, CommonModule, CalendarModule],
  providers: [MessageService],
  templateUrl: './products-agricultor.component.html',
  styleUrl: './products-agricultor.component.css'
})
export class ProductsAgricultorComponent {


  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService, private messageService: MessageService) {}
  
  datauser: any

  ngOnInit() {

    this.getData()


  }
  async getData() {

    let data = this.authService.getCurrentUser()
    let id = data?.uid ?? ''
    let result = await this.authService.getDocument('agricultores', id)

    this.datauser = result

  }

  registerProduct(){
    this.router.navigate(['/main-agricultor/register-product']);
  }

}
