import { Routes } from '@angular/router';
import { LandingpageComponent } from './landingpage/landingpage.component';
import { PricingpageComponent } from './pricingpage/pricingpage.component';

export const routes: Routes = [
  { path: 'landing', component: LandingpageComponent },
  { path: 'pricing', component: PricingpageComponent },
  { path: '', redirectTo: '/landing', pathMatch: 'full' },  // Redirige al landing por defecto
  // Redirect route for Stripe success URL
  { path: 'payment-success', redirectTo: 'comprador/payment-success', pathMatch: 'full' },
  { path: 'cart', redirectTo: 'comprador/cart', pathMatch: 'full' },
  {
    path: 'comprador',  // Ruta para el sistema comprador
    loadChildren: () =>
      import('./sistemacomprador/sistemacomprador.routes').then(m => m.compradorRoutes)
  },
  {
    path: 'agricultor',  // Prefijo para las rutas del agricultor
    loadChildren: () => import('./sistemaagricultor/sistemaagricultor.routes').then(m => m.agricultorRoutes)
  },
  {
    path: 'admin',  // Prefijo para las rutas del agricultor
    loadChildren: () => import('./sistemaadmin/sistemaadmin.routes').then(m => m.adminRoutes)
  },
];
