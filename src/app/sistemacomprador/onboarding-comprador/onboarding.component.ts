import { CommonModule } from '@angular/common';
import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Timestamp } from 'firebase/firestore';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { FileUploadModule } from 'primeng/fileupload';
import { InputMaskModule } from 'primeng/inputmask';
import { BadgeModule } from 'primeng/badge';
import { ImageModule } from 'primeng/image';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import * as L from 'leaflet';
import { HttpClientModule } from '@angular/common/http';
import { StepperModule } from 'primeng/stepper';

interface Gender {
  gender: string;
}

interface Ads {
  advertisements: string;
}

@Component({
  selector: 'app-onboardingcomprador',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StepperModule,
    ButtonModule,
    ScrollPanelModule,
    InputTextModule,
    DividerModule,
    InputTextareaModule,
    DropdownModule,
    CalendarModule,
    ReactiveFormsModule,
    FileUploadModule,
    BadgeModule,
    ProgressBarModule,
    ToastModule,
    InputMaskModule,
    ImageModule,
    HttpClientModule,
  ],
  providers: [MessageService],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OnboardingComponent implements AfterViewChecked, OnInit {


  onboardingForm: FormGroup;
  progressValue: number = 25; // Initial value
  currentStep = 1;
  selectedCoordinates: { lat: number; lng: number } | null = null;
  mapInitialized = false;  // To avoid reinitializing the map
  user: any;
  isLoading: boolean = false;

  gender: Gender[] | undefined;
  selectedGender: Gender | undefined;

  ads: Ads[] | undefined;
  selectedAd: Ads | undefined;
  nextCallback: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private authService: AuthService,
    private config: PrimeNGConfig
  ) {

    this.onboardingForm = this.fb.group({
      fullname: ['', Validators.required],
      birthday: ['', Validators.required],
      gender: ['', Validators.required],
      cellphone: ['', Validators.required],
      address: ['', Validators.required],
      ads: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.user = this.authService.getCurrentUser();

    setTimeout(() => {
      this.messageService.add({ severity: 'info', summary: 'Complete su perfil', detail: 'Llene todos los campos necesarios' });
    }, 100);

    this.gender = [
      { gender: 'Hombre' },
      { gender: 'Mujer' },
    ];

    this.ads = [
      { advertisements: 'Anuncios Físicos' },
      { advertisements: 'Redes Sociales' },
      { advertisements: 'Amigos' },
      { advertisements: 'Familiares' },
    ];
  }


  increaseProgress() {
    if (this.progressValue < 100) { // Ensure it doesn't exceed 100%
      this.progressValue += 25;
    }
  }

  decreaseProgress() {
    if (this.progressValue > 0) { // Ensure it doesn't go below 0%
      this.progressValue -= 25;
    }
  }

  ngAfterViewChecked(): void {
    // Only initialize the map when we are on 75% of the progress bar, which is associated with step 3 technically, and it hasn't been initialized yet
    if (this.progressValue === 25 && !this.mapInitialized) {
      this.initializeMap();
      this.mapInitialized = true;
    }

    // Necessary to ensure that the view change has been applied
    this.cdr.detectChanges();
  }


  private initializeMap(): void {
    var map = L.map('map').setView([-2.1896, -79.8891], 13); // Center the map on initial coordinates

    // Add OpenStreetMap base layer
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Create an empty marker layer to remove previously added markers
    let markerLayer = L.layerGroup().addTo(map);

    // Try to get the user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 13); // Set the view to the user's location
        },
        error => {
          console.error('No se pudo obtener la ubicación:', error);
        }
      );
    }

    // Capture clicks on the map to get the selected location
    map.on('click', (event: L.LeafletMouseEvent) => {
      const { lat, lng } = event.latlng;
      this.selectedCoordinates = { lat, lng };

      // Remove all previous markers
      markerLayer.clearLayers();

      // Use Nominatim (OpenStreetMap) to get the address from the coordinates
      const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

      fetch(geocodeUrl)
        .then(response => response.json())
        .then(data => {
          const address = data.display_name || 'Dirección no disponible';
          console.log('Dirección: ', address); // Print the address to the console

          this.onboardingForm.patchValue({
            address: address
          });

          // Add the new marker with the address
          const popup = L.popup()
            .setLatLng([lat, lng]) // Ubicación del popup
            .setContent(`Ubicación seleccionada: ${address}`) // Texto del popup
            .openOn(map); // Agregarlo al mapa
        })
        .catch(error => {
          console.error('Error al obtener la dirección:', error);
        });
    });
  }

  submitm(): void {
    if (this.selectedCoordinates) {
      this.onboardingForm.patchValue({
        address: `${this.selectedCoordinates.lat}, ${this.selectedCoordinates.lng}`
      });
      console.log('Formulario actualizado con coordenadas:', this.onboardingForm.value);
    } else {
      console.error('Por favor, selecciona una ubicación.');
    }
  }

  hasMinWords(fieldName: string, minWords: number): boolean {
    const value = this.onboardingForm.get(fieldName)?.value || '';
    const words = value.trim().split(/\s+/);
    return words.length >= minWords;
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        const birthday = this.onboardingForm.get('birthday')?.value;
        const isAdult = this.isAgeValid(birthday);
        return this.hasMinWords('fullname', 2) && isAdult;
      case 2:
        return (this.onboardingForm.get('address')?.valid ?? false);
      case 3:
        return (this.onboardingForm.get('cellphone')?.valid ?? false) &&
          (this.onboardingForm.get('gender')?.valid ?? false);

      case 4:
        return (this.onboardingForm.get('ads')?.valid ?? false);
      default:
        return true;
    }
  }


  private isAgeValid(birthday: string): boolean {
    if (!birthday) return false;

    const birthDate = new Date(birthday);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    // Verifica si la fecha de cumpleaños ya ha pasado este año
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      return age >= 18; // Si no ha pasado el cumpleaños, verifica si la edad es mayor o igual a 18
    }

    return age >= 18; // Si ha pasado el cumpleaños, verifica si la edad es mayor o igual a 18

  }

  async submit() {
    this.isLoading = true;
    try {
      const datosFormulario = this.onboardingForm.value; // These are the form data
      const fechaCreacion = Timestamp.fromDate(new Date()); // Get the current date and time as a timestamp
      const datosAdicionales = {
        onboarding: true, // This is to update the onboarding property
        creationDate: fechaCreacion, // This is to add to the database
      };

      // Create a single object
      const datosActualizados = {
        ...datosFormulario,
        ...datosAdicionales,
      };

      await this.authService.updateDocument('users', this.user.uid, datosActualizados);
      this.onboardingForm.reset();
      this.router.navigate(['/main-comprador']);
    } catch (error: any) {
      this.isLoading = false;
      console.log(error.message);
    }
  }
}