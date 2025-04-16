import { Routes } from '@angular/router';
import { SidebarComponent } from './sidebar-agricultor/sidebar.component';
import { ProductsAgricultorComponent } from './products-agricultor/products-agricultor.component';
import { RegisterProductsComponent } from './register-products/register-products.component';
import { SettingsComponent } from './settings/settings.component';
import { LoginComponent2 } from './login-agricultor/login.component';
import { SignupComponent2 } from './signup-agricultor/signup-agricultor.component';
import { OnboardingAgricultorComponent } from './onboarding-agricultor/onboarding-agricultor.component';
import { ProfileAgricultorComponent } from './profile-agricultor/profile-agricultor.component';
import { HaciendaComponent } from './hacienda/hacienda.component';
import { SupportComponent } from './support/support.component';

export const agricultorRoutes: Routes = [
  { path: 'login-agricultor', component: LoginComponent2 },
  { path: 'signup-agricultor', component: SignupComponent2 },
  { path: 'onboarding-agricultor', component: OnboardingAgricultorComponent },
  { path: 'profile-agricultor', component: ProfileAgricultorComponent },
  { path: 'hacienda', component: HaciendaComponent },
  {
    path: 'main-agricultor',
    component: SidebarComponent,
    children: [
      { path: '', redirectTo: 'productos', pathMatch: 'full' },
      { path: 'productos', component: ProductsAgricultorComponent },
      { path: 'register-product', component: RegisterProductsComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'support', component: SupportComponent },
    ]
  }
];
