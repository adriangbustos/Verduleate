import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoadingService } from '../services/loading.service';

export const authAdminGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const loadingService = inject(LoadingService);

  try {
    loadingService.show();
    
    // Verifica si el usuario está autenticado
    const isAuthenticated = await authService.isAuthenticatedPromise();
    
    if (!isAuthenticated) {
      console.log('Usuario no autenticado, redirigiendo al login de admin');
      loadingService.hide();
      router.navigate(['/admin/login']);
      return false;
    }

    // Obtener el usuario actual
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser) {
      console.log('No se pudo obtener el usuario actual');
      loadingService.hide();
      router.navigate(['/admin/login']);
      return false;
    }

    // Verificar que el usuario existe en la colección de administradores
    const adminData = await authService.getAdminData(currentUser.uid);
    
    if (!adminData) {
      console.log('Usuario no encontrado en la colección de administradores');
      loadingService.hide();
      router.navigate(['/admin/login']);
      return false;
    }

    console.log('Acceso autorizado para administrador:', currentUser.uid);
    loadingService.hide();
    return true;
    
  } catch (error) {
    console.error('Error en el guard de autenticación de admin:', error);
    loadingService.hide();
    router.navigate(['/admin/login']);
    return false;
  }
};
