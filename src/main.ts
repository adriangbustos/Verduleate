import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Import Firebase (Nueva API Standalone)
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

// Import environment config
import { firebaseConfig } from './environments/environment';

// Agregar Firebase a la configuración de la app
const firebaseProviders = [
  provideFirebaseApp(() => initializeApp(firebaseConfig)),
  provideAuth(() => getAuth()),
  provideFirestore(() => getFirestore())
];

// Mezclar Firebase con appConfig
const mergedConfig = {
  ...appConfig,
  providers: [...(appConfig.providers || []), ...firebaseProviders]
};

bootstrapApplication(AppComponent, mergedConfig)
  .catch((err) => console.error(err));
