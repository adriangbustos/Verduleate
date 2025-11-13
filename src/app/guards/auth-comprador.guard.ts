import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authCompradorGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  try {
    // Verifica si el usuario está autenticado
    const isAuthenticated = await authService.isAuthenticatedPromise();
    
    if (!isAuthenticated) {
      console.log('Usuario no autenticado, redirigiendo al login de comprador');
      router.navigate(['/comprador/login-comprador']);
      return false;
    }

    // Obtener el usuario actual
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser) {
      console.log('No se pudo obtener el usuario actual');
      router.navigate(['/comprador/login-comprador']);
      return false;
    }

    // Verificar que el usuario existe en la colección de users (compradores)
    const compradorData = await authService.getUserData(currentUser.uid);
    
    if (!compradorData) {
      console.log('Usuario no encontrado en la colección de compradores');
      router.navigate(['/comprador/login-comprador']);
      return false;
    }

    console.log('Acceso autorizado para comprador:', currentUser.uid);
    return true;
    
  } catch (error) {
    console.error('Error en el guard de autenticación:', error);
    router.navigate(['/comprador/login-comprador']);
    return false;
  }
};
