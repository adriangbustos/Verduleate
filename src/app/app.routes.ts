import { Routes } from '@angular/router';
import { SignUpComponent } from './sistemacomprador/signup-comprador/signup-comprador.component';
import { MainpageComponent } from './sistemacomprador/main-comprador/mainpage.component';
import { LoginComponent } from './sistemacomprador/login-comprador/login.component';
import { OnboardingComponent } from './sistemacomprador/onboarding-comprador/onboarding.component';
import { LandingpageComponent } from './landingpage/landingpage.component';
import { LoginComponent2 } from './sistemaagricultor/login-agricultor/login.component';
import { SignupComponent2 } from './sistemaagricultor/signup-agricultor/signup-agricultor.component';
import { SidebarComponent } from './sistemaagricultor/sidebar-agricultor/sidebar.component';
import { OnboardingAgricultorComponent } from './sistemaagricultor/onboarding-agricultor/onboarding-agricultor.component';
import { SettingsComponent } from './sistemaagricultor/settings/settings.component';
import { ProfileAgricultorComponent } from './sistemaagricultor/profile-agricultor/profile-agricultor.component';
import { ProductsAgricultorComponent } from './sistemaagricultor/products-agricultor/products-agricultor.component';
import { RegisterProductsComponent } from './sistemaagricultor/register-products/register-products.component';
import { HaciendaComponent } from './sistemaagricultor/hacienda/hacienda.component';

export const routes: Routes = [
    { path: 'landing', component: LandingpageComponent },
    { path: 'signup-comprador', component: SignUpComponent },
    { path: 'main-comprador', component: MainpageComponent },
    { path: 'login-comprador', component: LoginComponent },
    { path: 'login-agricultor', component: LoginComponent2 },
    { path: 'signup-agricultor', component: SignupComponent2 },
    { path: 'main-agricultor', component: SidebarComponent, children: [
        { path: '', redirectTo: 'productos', pathMatch: 'full' }, // Redirección automática
        { path: 'productos', component: ProductsAgricultorComponent },
        { path: 'settings', component: SettingsComponent },
        { path: 'register-product', component: RegisterProductsComponent }
    ]},
    { path: 'onboarding-comprador', component: OnboardingComponent },
    { path: 'onboarding-agricultor', component: OnboardingAgricultorComponent },
    { path: 'profile-agricultor', component: ProfileAgricultorComponent },
    { path: 'hacienda', component: HaciendaComponent},
    { path: '', redirectTo: '/landing', pathMatch: 'full' },
];

