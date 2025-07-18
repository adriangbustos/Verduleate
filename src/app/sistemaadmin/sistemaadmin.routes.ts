import { MainPageAdminComponent } from "./mainpage-admin/mainpage-admin.component";
import { Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component'

export const adminRoutes: Routes = [
  { path: 'main', component: MainPageAdminComponent },
  { path: 'chat', component: ChatComponent },

];