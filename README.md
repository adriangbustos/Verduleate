# Verduleate 🥬

[![License: MIT](https://img.shields.io/badge/License-MIT-44CC11?style=for-the-badge)](LICENSE)

Una plataforma web y mercado agrícola digital que conecta a los agricultores ecuatorianos directamente con los consumidores finales, eliminando intermediarios y promoviendo el comercio justo de productos frescos.

<div align="center">
  <img src="https://img.shields.io/badge/Angular_17-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white" alt="Leaflet" />
  <img src="https://img.shields.io/badge/Stripe-008CDD?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-44CC11?style=for-the-badge" alt="MIT License" />
</div>

---

## Características Principales

### 👨‍🌾 Para Agricultores (Sistema Agricultor)
- **Onboarding de Productores:** Registro asistido y configuración del perfil de la hacienda o granja.
- **Gestión de Cosechas:** Catálogo para añadir, editar y gestionar inventario, precios por quintal/libra, stock y fotografías.
- **Geolocalización:** Ubicación cartográfica de la finca para rutas logísticas y proximidad.
- **Panel de Ventas:** Control de pedidos entrantes, despachos y liquidaciones.

### 🛒 Para Compradores (Sistema Comprador)
- **Mapa Interactivo de Fincas:** Explorador interactivo impulsado por Leaflet para ubicar parcelas y productores cercanos.
- **Catálogo de Frescura:** Filtros inteligentes por hortalizas, tubérculos, frutas, legumbres y productos orgánicos.
- **Carrito y Pasarela:** Checkout integrado con Stripe para transacciones seguras.
- **Historial y Despacho:** Seguimiento en tiempo real del estado de cada pedido.

### 🛡️ Para Administradores (Sistema Admin)
- **Panel Central:** Métricas de volumen comercializado, usuarios activos y transacciones.
- **Soporte y Mensajería:** Canal de chat para soporte directo entre compradores y administradores.

---

## Estructura del Proyecto

```
VERDULEATE/
├── src/
│   ├── app/
│   │   ├── landingpage/         # Portal de bienvenida y catálogo público
│   │   ├── sistema-agricultor/  # Módulo administrativo para productores agrícolas
│   │   ├── sistema-comprador/   # Carrito, mapa de fincas y pedidos para clientes
│   │   ├── sistema-admin/       # Monitoreo general y gestión de usuarios
│   │   └── services/            # Servicios de Firebase Auth, Firestore y Stripe
│   ├── assets/                  # Iconografía y recursos visuales
│   └── environments/            # Configuraciones de Firebase y pasarela
└── angular.json                 # Configuración de compilación Angular CLI
```

---

## Primeros Pasos

### Requisitos Previos
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/adriangbustos/Verduleate.git
cd Verduleate

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
ng serve
```
Abre tu navegador en `http://localhost:4200`.

---

## Licencia

Este proyecto está bajo la Licencia MIT - consulta el archivo [LICENSE](LICENSE) para más detalles.
