import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoadingService } from '../services/loading.service';

export const onboardingCompradorGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const loadingService = inject(LoadingService);

  try {
    loadingService.show();
    
    // Verifica si el usuario está autenticado
    const isAuthenticated = await authService.isAuthenticatedPromise();
    
    if (!isAuthenticated) {
      console.log('Usuario no autenticado, redirigiendo al login');
      loadingService.hide();
      router.navigate(['/comprador/login-comprador']);
      return false;
    }

    // Obtener el usuario actual
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser) {
      loadingService.hide();
      router.navigate(['/comprador/login-comprador']);
      return false;
    }

    // Verificar el estado del onboarding
    const compradorData = await authService.getUserData(currentUser.uid);
    
    if (!compradorData) {
      loadingService.hide();
      router.navigate(['/comprador/login-comprador']);
      return false;
    }

    // Si el onboarding ya está completo, redirigir a main
    if (compradorData['onboarding'] === true) {
      console.log('Onboarding ya completado, redirigiendo a main');
      loadingService.hide();
      router.navigate(['/comprador/main-comprador']);
      return false;
    }

    // Si el onboarding no está completo, permitir acceso
    loadingService.hide();
    return true;
    
  } catch (error) {
    console.error('Error en el guard de onboarding:', error);
    loadingService.hide();
    router.navigate(['/comprador/login-comprador']);
    return false;
  }
};
