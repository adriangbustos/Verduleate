# Sistema de Autenticación y Guards - Verduleate

## 📋 Resumen de Implementación

Se han implementado **Guards de seguridad** y **recuperación de sesión** para ambos sistemas (Agricultor y Comprador).

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
| **Manejo de errores** | Feedback claro al usuario con toast messages |
| **Auto-redirección** | Lleva al usuario a la ruta correcta automáticamente |

## 🧪 Cómo Probar

1. **Cerrar sesión** → Intentar acceder a `/agricultor/main-agricultor`
   - Debería redirigir a `/agricultor/login-agricultor`

2. **Iniciar sesión** → Recargar página
   - La sesión debería mantenerse
   - Los datos del usuario se cargan automáticamente

3. **Usuario sin onboarding** → Iniciar sesión
   - Debería redirigir a `/agricultor/onboarding-agricultor`

4. **Usuario con onboarding** → Intentar acceder a onboarding
   - Debería redirigir a `/agricultor/main-agricultor`

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
