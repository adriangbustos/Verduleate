import { Routes } from '@angular/router';
import { LoginComponent } from './login-comprador/login.component';
import { SignUpComponent } from './signup-comprador/signup-comprador.component';
import { MainpageComponent } from './main-comprador/mainpage.component';
import { OnboardingComponent } from './onboarding-comprador/onboarding.component';
import { MapandproductsComponent } from './mapandproducts/mapandproducts.component';

export const compradorRoutes: Routes = [
  { path: 'login-comprador', component: LoginComponent },
  { path: 'signup-comprador', component: SignUpComponent },
  { path: 'main-comprador', component: MainpageComponent },
  { path: 'onboarding-comprador', component: OnboardingComponent },
  { path: 'verduras/:provincia', component: MapandproductsComponent }
];
