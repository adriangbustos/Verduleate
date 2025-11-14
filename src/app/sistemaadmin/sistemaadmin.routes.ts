import { MainPageAdminComponent } from "./mainpage-admin/mainpage-admin.component";
import { Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { LoginAdminComponent } from './login-admin/login-admin.component';
import { authAdminGuard } from '../guards/auth-admin.guard';

export const adminRoutes: Routes = [
  { path: 'login', component: LoginAdminComponent },
  { path: 'main', component: MainPageAdminComponent, canActivate: [authAdminGuard] },
  { path: 'chat', component: ChatComponent, canActivate: [authAdminGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];