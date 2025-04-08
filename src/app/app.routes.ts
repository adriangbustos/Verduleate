import { Routes } from '@angular/router';
import { LandingpageComponent } from './landingpage/landingpage.component';

export const routes: Routes = [
  { path: 'landing', component: LandingpageComponent },
  {
    path: 'comprador',  // Ruta para el sistema comprador
    loadChildren: () =>
      import('./sistemacomprador/sistemacomprador.routes').then(m => m.compradorRoutes)
  },
  {
    path: 'agricultor',  // Prefijo para las rutas del agricultor
    loadChildren: () => import('./sistemaagricultor/sistemaagricultor.routes').then(m => m.agricultorRoutes)
  },
  { path: '', redirectTo: '/landing', pathMatch: 'full' }  // Redirige al landing por defecto
];
