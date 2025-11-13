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
import { authCompradorGuard } from '../guards/auth-comprador.guard';
import { onboardingCompradorGuard } from '../guards/onboarding-comprador.guard';

export const compradorRoutes: Routes = [
  { path: '', redirectTo: 'main-comprador', pathMatch: 'full' },
  { path: 'login-comprador', component: LoginComponent },
  { path: 'signup-comprador', component: SignUpComponent },
  { 
    path: 'main-comprador', 
    component: MainpageComponent,
    canActivate: [authCompradorGuard]
  },
  { 
    path: 'onboarding-comprador', 
    component: OnboardingComponent,
    canActivate: [onboardingCompradorGuard]
  },
  { 
    path: 'verduras/:provincia', 
    component: MapandproductsComponent,
    canActivate: [authCompradorGuard]
  },
  { 
    path: 'product/:id', 
    component: ProductspageComponent,
    canActivate: [authCompradorGuard]
  },
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [authCompradorGuard]
  },
  { 
    path: 'cart', 
    component: CartComponent,
    canActivate: [authCompradorGuard]
  },
  { 
    path: 'payment-success', 
    component: PaymentSuccessComponent,
    canActivate: [authCompradorGuard]
  }
];
