# Sistema de Autenticación y Guards - Verduleate

## 📋 Resumen de Implementación

Se han implementado **Guards de seguridad**, **recuperación de sesión** y **loader global** para ambos sistemas (Agricultor y Comprador).

## 🛡️ Guards Creados

### Para Agricultores:
1. **`auth-agricultor.guard.ts`** - Protege rutas que requieren autenticación
2. **`onboarding-agricultor.guard.ts`** - Maneja el flujo del onboarding

### Para Compradores:
1. **`auth-comprador.guard.ts`** - Protege rutas que requieren autenticación
2. **`onboarding-comprador.guard.ts`** - Maneja el flujo del onboarding

## 🔄 Recuperación de Sesión

### SidebarComponent (Agricultor)
El componente sidebar ahora implementa `OnInit` para:
- ✅ Restaurar la sesión automáticamente al cargar
- ✅ Verificar autenticación con Firebase
- ✅ Obtener datos del usuario desde Firestore
- ✅ Redirigir al onboarding si no está completado
- ✅ Mostrar mensajes de error apropiados
- ✅ Limpiar sesión si hay errores

## ⏳ Loader Global

### LoadingService
Servicio centralizado que controla el estado de carga:
- Observable `loading$` para suscribirse
- Métodos `show()` y `hide()` 
- Usado automáticamente por todos los guards

### GlobalLoaderComponent
Componente visual que muestra:
- ✨ Spinner animado con colores del tema
- 📝 Mensaje "Cargando..."
- 🎨 Fondo translúcido blanco
- 📍 Posición fija centrada
- 🔝 Z-index alto (9999) para estar sobre todo

**Beneficio:** Elimina las pantallas blancas durante la verificación de autenticación

## 📦 Servicio de Sesión (SessionService)

Un servicio opcional centralizado para manejar el estado de la sesión:
- Observable `session$` para suscribirse a cambios
- Métodos para establecer, obtener y limpiar sesión
- Soporte para ambos tipos de usuario (agricultor/comprador)

## 🚦 Rutas Protegidas

### Sistema Agricultor:
```typescript
✅ /agricultor/main-agricultor       → authAgricultorGuard
✅ /agricultor/profile-agricultor    → authAgricultorGuard
✅ /agricultor/hacienda              → authAgricultorGuard
✅ /agricultor/onboarding-agricultor → onboardingAgricultorGuard
```

### Sistema Comprador:
```typescript
✅ /comprador/main-comprador         → authCompradorGuard
✅ /comprador/profile                → authCompradorGuard
✅ /comprador/cart                   → authCompradorGuard
✅ /comprador/verduras/:provincia    → authCompradorGuard
✅ /comprador/product/:id            → authCompradorGuard
✅ /comprador/payment-success        → authCompradorGuard
✅ /comprador/onboarding-comprador   → onboardingCompradorGuard
```

## 🔑 Flujo de Autenticación

### 1. Usuario intenta acceder a ruta protegida
```
Usuario → Guard → Verificar autenticación
                     ↓
              ¿Autenticado?
              ↙           ↘
            SÍ            NO
            ↓              ↓
      Permitir acceso   Redirigir a login
```

### 2. Al cargar el SidebarComponent
```
ngOnInit → restoreUserSession()
              ↓
   Verificar Firebase Auth
              ↓
   Obtener datos de Firestore
              ↓
   Actualizar SessionService
              ↓
   ¿Onboarding completo?
       ↙           ↘
      SÍ           NO
      ↓             ↓
   Continuar   Redirigir a onboarding
```

## 💡 Ventajas de esta implementación

| Característica | Beneficio |
|---------------|-----------|
| **Guards** | Seguridad en rutas, previene acceso no autorizado |
| **ngOnInit en Sidebar** | Carga rápida de sesión, mejor UX |
| **SessionService** | Estado centralizado, fácil acceso desde cualquier componente |
| **LoadingService + GlobalLoader** | Elimina pantallas blancas, mejor experiencia visual |
| **Manejo de errores** | Feedback claro al usuario con toast messages |
| **Auto-redirección** | Lleva al usuario a la ruta correcta automáticamente |

## 🧪 Cómo Probar

1. **Cerrar sesión** → Intentar acceder a `/agricultor/main-agricultor`
   - Debería mostrar el loader brevemente
   - Luego redirigir a `/agricultor/login-agricultor`

2. **Iniciar sesión** → Recargar página
   - Verás el loader mientras verifica la sesión
   - La sesión se mantiene y los datos se cargan automáticamente

3. **Usuario sin onboarding** → Iniciar sesión
   - Loader aparece
   - Debería redirigir a `/agricultor/onboarding-agricultor`

4. **Usuario con onboarding** → Intentar acceder a onboarding
   - Loader aparece
   - Debería redirigir a `/agricultor/main-agricultor`

5. **Navegación entre rutas protegidas**
   - El loader aparece brevemente en cada cambio de ruta
   - No más pantallas blancas ✨

## 🔧 Uso del SessionService en otros componentes

```typescript
import { SessionService } from '../../services/session.service';

export class MiComponente {
  constructor(private sessionService: SessionService) {
    // Suscribirse a cambios de sesión
    this.sessionService.session$.subscribe(session => {
      if (session) {
        console.log('Usuario:', session.email);
        console.log('Tipo:', session.userType);
        console.log('Datos:', session.userData);
      }
    });
    
    // Obtener sesión actual
    const currentSession = this.sessionService.getSession();
  }
}
```

## 🎨 Uso del LoadingService en tus componentes

Puedes reutilizar el `LoadingService` en cualquier componente para operaciones asíncronas:

```typescript
import { LoadingService } from '../../services/loading.service';

export class MiComponente {
  constructor(private loadingService: LoadingService) {}
  
  async cargarDatos() {
    this.loadingService.show(); // Muestra el loader global
    
    try {
      // Tu lógica aquí
      const datos = await this.authService.getDocument('coleccion', 'id');
      // Procesar datos...
    } catch (error) {
      console.error('Error:', error);
    } finally {
      this.loadingService.hide(); // Siempre ocultar en finally
    }
  }
  
  // También puedes verificar si está cargando
  verificarEstado() {
    if (this.loadingService.isLoading()) {
      console.log('Ya hay una operación en curso');
    }
  }
}
```

**Ventaja:** Un solo loader global para toda la aplicación, consistencia visual.

## 📝 Notas Importantes

- Los guards son **asíncronos** porque verifican con Firebase
- El `SidebarComponent` se ejecuta en cada carga del sistema
- Los datos se obtienen directamente de Firestore (fuente de verdad)
- No se usa localStorage para evitar problemas de sincronización
- Firebase Auth maneja automáticamente la persistencia de sesión

## 🎯 Próximos Pasos Sugeridos

1. Implementar el mismo patrón en componentes principales de comprador
2. Agregar interceptores HTTP para añadir tokens a las peticiones
3. Implementar refresh token si es necesario
4. Agregar logging/analytics de sesiones
5. Implementar "remember me" con diferentes políticas de persistencia

---

✅ **Sistema completamente implementado y listo para usar**
