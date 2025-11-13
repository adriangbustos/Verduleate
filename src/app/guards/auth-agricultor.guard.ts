import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authAgricultorGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  try {
    // Verifica si el usuario está autenticado
    const isAuthenticated = await authService.isAuthenticatedPromise();
    
    if (!isAuthenticated) {
      console.log('Usuario no autenticado, redirigiendo al login de agricultor');
      router.navigate(['/agricultor/login-agricultor']);
      return false;
    }

    // Obtener el usuario actual
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser) {
      console.log('No se pudo obtener el usuario actual');
      router.navigate(['/agricultor/login-agricultor']);
      return false;
    }

    // Verificar que el usuario existe en la colección de agricultores
    const agricultorData = await authService.getAgricultorData(currentUser.uid);
    
    if (!agricultorData) {
      console.log('Usuario no encontrado en la colección de agricultores');
      router.navigate(['/agricultor/login-agricultor']);
      return false;
    }

    console.log('Acceso autorizado para agricultor:', currentUser.uid);
    return true;
    
  } catch (error) {
    console.error('Error en el guard de autenticación:', error);
    router.navigate(['/agricultor/login-agricultor']);
    return false;
  }
};
