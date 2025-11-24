# Verduleate 🥑

Verduleate es una plataforma web moderna que conecta a los agricultores directamente con los consumidores. Proporciona un mercado en línea donde los agricultores pueden exhibir y vender sus productos frescos, y los compradores pueden encontrar y comprar fácilmente productos agrícolas locales.

## ✨ Características Principales

La plataforma se divide en tres roles de usuario principales, cada uno con su propio sistema dedicado:

### 👨‍🌾 Para Agricultores (Sistema Agricultor)
- **Onboarding:** Registro fácil y configuración del perfil de la granja.
- **Gestión de Productos:** Añadir, editar y gestionar listados de productos con detalles como precio, stock e imágenes.
- **Perfil de la Granja (`Hacienda`):** Gestionar la información y ubicación de la granja.
- **Seguimiento de Ventas:** Ver y gestionar los pedidos entrantes.

### 🛒 Para Compradores (Sistema Comprador)
- **Mapa Interactivo:** Descubre agricultores y productos locales en un mapa interactivo impulsado por Leaflet.
- **Descubrimiento de Productos:** Navega, busca y filtra una amplia variedad de productos frescos.
- **Carrito de Compras:** Una experiencia de compra simple e intuitiva.
- **Pagos Seguros:** Integrado con Stripe para transacciones seguras y confiables.
- **Perfil de Usuario:** Gestiona la información personal y consulta el historial de pedidos.

### ⚙️ Para Administradores (Sistema Admin)
- **Panel de Control:** Un panel central para monitorear la actividad de la plataforma.
- **Gestión de Usuarios:** Supervisar a todos los agricultores y compradores registrados.
- **Soporte:** Una interfaz de chat para brindar soporte a los usuarios.

## 🛠️ Tecnologías Utilizadas

Este proyecto está construido con un stack de tecnología moderno y robusto:

- **Frontend:**
  - [Angular](https://angular.io/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [PrimeNG](https://primeng.org/): Biblioteca de componentes de interfaz de usuario.
  - [Leaflet.js](https://leafletjs.com/): Para mapas interactivos.
  - [PrimeIcons](https://primeflex.org/primeicons): Biblioteca de iconos.

- **Backend y Base de Datos:**
  - [Firebase](https://firebase.google.com/): Utilizado para autenticación (Firebase Auth) y base de datos (Firestore).

- **Pagos:**
  - [Stripe](https://stripe.com/): Para procesar pagos en línea.

- **Desarrollo y API:**
  - [Node.js](https://nodejs.org/) y [Express](https://expressjs.com/): Potencia el servidor de pagos de Stripe y una API de generación de datos.
  - [@faker-js/faker](https://fakerjs.dev/): Para generar datos de prueba realistas para el desarrollo.

## 🚀 Cómo Empezar

Sigue estas instrucciones para obtener una copia local del proyecto en funcionamiento.

### Prerrequisitos

- [Node.js](https://nodejs.org/en/download/) (que incluye npm)
- [Angular CLI](https://angular.io/cli)

```bash
npm install -g @angular/cli
```

### Instalación y Configuración

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/adriangbustos/Verduleate.git
    cd Verduleate
    ```

2.  **Instala las Dependencias del Frontend:**
    ```bash
    npm install
    ```

3.  **Instala las Dependencias del Servidor:**
    El proyecto contiene dos servidores Node.js separados.

    -   **Servidor de Pagos (Stripe):**
        ```bash
        cd server
        npm install
        cd ..
        ```
    -   **API de Generación de Datos:**
        ```bash
        cd api
        npm install
        cd ..
        ```

4.  **Configura las Variables de Entorno:**
    Necesitarás configurar tu propia configuración para Firebase y Stripe.
    -   **Firebase:** Crea un archivo `firebase-config.js` en el directorio `api/` con tus credenciales de proyecto de Firebase.
    -   **Stripe:** Añade tus claves de API de Stripe en el archivo `server/index.js`.

### Ejecutando la Aplicación

Necesitas ejecutar tres procesos separados para que la aplicación completa funcione.

1.  **Inicia el Frontend de Angular:**
    Este comando inicia el servidor de desarrollo para la aplicación principal.
    ```bash
    npm start
    ```
    Navega a `http://localhost:4200/`.

2.  **Inicia el Servidor de Pagos (Stripe):**
    Este servidor maneja el procesamiento de pagos.
    ```bash
    cd server
    node index.js
    ```

3.  **Inicia la API de Generación de Datos (Opcional):**
    Esta API se utiliza para poblar la base de datos con datos de prueba.
    ```bash
    cd api
    npm start
    ```

## 📂 Estructura del Proyecto

El repositorio está organizado de la siguiente manera:

```
/
├── api/              # API de Node.js para generar datos de prueba.
├── server/           # Servidor de Node.js para pagos con Stripe.
├── src/              # Código fuente principal de la aplicación Angular.
│   ├── app/
│   │   ├── components/   # Componentes globales (ej. loader).
│   │   ├── guards/       # Guards de ruta para autenticación/autorización.
│   │   ├── services/     # Servicios principales (Auth, Admin, etc.).
│   │   ├── sistemaadmin/ # Funcionalidades para administradores.
│   │   ├── sistemaagricultor/ # Funcionalidades para agricultores.
│   │   └── sistemacomprador/  # Funcionalidades para compradores.
│   ├── assets/         # Recursos estáticos como imágenes e iconos.
│   └── environments/   # Configuraciones específicas del entorno.
├── angular.json      # Configuración del proyecto Angular.
├── firebase.json     # Configuración de Firebase hosting y functions.
└── package.json      # Dependencias y scripts de npm del frontend.
```