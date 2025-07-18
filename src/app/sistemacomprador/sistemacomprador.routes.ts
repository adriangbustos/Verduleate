import { Routes } from '@angular/router';
import { LoginComponent } from './login-comprador/login.component';
import { SignUpComponent } from './signup-comprador/signup-comprador.component';
import { MainpageComponent } from './main-comprador/mainpage.component';
import { OnboardingComponent } from './onboarding-comprador/onboarding.component';
import { MapandproductsComponent } from './mapandproducts/mapandproducts.component';
import { ProductspageComponent } from './productspage/productspage.component';
import { ProfileComponent } from './profile/profile.component';
import { CartComponent } from './cart/cart.component';
import { PaymentSuccessComponent } from './payment-success/payment-success.component';

export const compradorRoutes: Routes = [
  { path: '', redirectTo: 'main-comprador', pathMatch: 'full' },
  { path: 'login-comprador', component: LoginComponent },
  { path: 'signup-comprador', component: SignUpComponent },
  { path: 'main-comprador', component: MainpageComponent },
  { path: 'onboarding-comprador', component: OnboardingComponent },
  { path: 'verduras/:provincia', component: MapandproductsComponent },
  { path: 'product/:id', component: ProductspageComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'cart', component: CartComponent },
  { path: 'payment-success', component: PaymentSuccessComponent }
];
