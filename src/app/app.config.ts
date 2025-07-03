import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideAnimationsAsync(), provideFirebaseApp(() => initializeApp({ "projectId": "verduleate-4e5c0", "appId": "1:337862343335:web:82ec306acef5c4fb5e7982", "storageBucket": "verduleate-4e5c0.firebasestorage.app", "apiKey": "AIzaSyC0GIlssVm0jsFRaRLyrzmwAS3WSrcJ5so", "authDomain": "verduleate-4e5c0.firebaseapp.com", "messagingSenderId": "337862343335" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())],
};
