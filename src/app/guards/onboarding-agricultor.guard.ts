import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const onboardingAgricultorGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  try {
    // Verifica si el usuario está autenticado
    const isAuthenticated = await authService.isAuthenticatedPromise();
    
    if (!isAuthenticated) {
      console.log('Usuario no autenticado, redirigiendo al login');
      router.navigate(['/agricultor/login-agricultor']);
      return false;
    }

    // Obtener el usuario actual
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser) {
      router.navigate(['/agricultor/login-agricultor']);
      return false;
    }

    // Verificar el estado del onboarding
    const agricultorData = await authService.getAgricultorData(currentUser.uid);
    
    if (!agricultorData) {
      router.navigate(['/agricultor/login-agricultor']);
      return false;
    }

    // Si el onboarding ya está completo, redirigir a main
    if (agricultorData['onboarding'] === true) {
      console.log('Onboarding ya completado, redirigiendo a main');
      router.navigate(['/agricultor/main-agricultor']);
      return false;
    }

    // Si el onboarding no está completo, permitir acceso
    return true;
    
  } catch (error) {
    console.error('Error en el guard de onboarding:', error);
    router.navigate(['/agricultor/login-agricultor']);
    return false;
  }
};
