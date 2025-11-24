# Verduleate 🥑

Verduleate is a modern web platform that connects farmers directly with consumers. It provides an online marketplace where farmers can showcase and sell their fresh produce, and buyers can easily find and purchase local agricultural products.

## ✨ Key Features

The platform is divided into three main user roles, each with its own dedicated system:

### 👨‍🌾 For Farmers (Sistema Agricultor)
- **Onboarding:** Easy registration and farm profile setup.
- **Product Management:** Add, edit, and manage product listings with details like price, stock, and images.
- **Farm Profile (`Hacienda`):** Manage farm information and location.
- **Sales Tracking:** View and manage incoming orders.

### 🛒 For Buyers (Sistema Comprador)
- **Interactive Map:** Discover local farmers and products on an interactive map powered by Leaflet.
- **Product Discovery:** Browse, search, and filter a wide variety of fresh produce.
- **Shopping Cart:** A simple and intuitive shopping cart experience.
- **Secure Payments:** Integrated with Stripe for secure and reliable transactions.
- **User Profile:** Manage personal information and view order history.

### ⚙️ For Admins (Sistema Admin)
- **Dashboard:** A central dashboard to monitor platform activity.
- **User Management:** Oversee all registered farmers and buyers.
- **Support:** A chat interface to provide support to users.

## 🛠️ Tech Stack

This project is built with a modern and robust technology stack:

- **Frontend:**
  - [Angular](https://angular.io/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [PrimeNG](https://primeng.org/): Rich UI component library.
  - [Leaflet.js](https://leafletjs.com/): For interactive maps.
  - [PrimeIcons](https://primeflex.org/primeicons): Icon library.

- **Backend & Database:**
  - [Firebase](https://firebase.google.com/): Used for authentication (Firebase Auth) and database (Firestore).

- **Payments:**
  - [Stripe](https://stripe.com/): For processing online payments.

- **Development & API:**
  - [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/): Powers the Stripe payment server and a data generation API.
  - [@faker-js/faker](https://fakerjs.dev/): To generate realistic test data for development.

## 🚀 Getting Started

Follow these instructions to get a local copy of the project up and running.

### Prerequisites

- [Node.js](https://nodejs.org/en/download/) (which includes npm)
- [Angular CLI](https://angular.io/cli)

```bash
npm install -g @angular/cli
```

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/adriangbustos/Verduleate.git
    cd Verduleate
    ```

2.  **Install Frontend Dependencies:**
    ```bash
    npm install
    ```

3.  **Install Server Dependencies:**
    The project contains two separate Node.js servers.

    -   **Payment Server (Stripe):**
        ```bash
        cd server
        npm install
        cd ..
        ```
    -   **Data Generation API:**
        ```bash
        cd api
        npm install
        cd ..
        ```

4.  **Configure Environment Variables:**
    You will need to set up your own configuration for Firebase and Stripe.
    -   **Firebase:** Create a `firebase-config.js` file in the `api/` directory with your Firebase project credentials.
    -   **Stripe:** Add your Stripe API keys to the `server/index.js` file.

### Running the Application

You need to run three separate processes for the full application to work.

1.  **Start the Angular Frontend:**
    This command starts the development server for the main application.
    ```bash
    npm start
    ```
    Navigate to `http://localhost:4200/`.

2.  **Start the Payment Server (Stripe):**
    This server handles payment processing.
    ```bash
    cd server
    node index.js
    ```

3.  **Start the Data Generation API (Optional):**
    This API is used to populate the database with test data.
    ```bash
    cd api
    npm start
    ```

## 📂 Project Structure

The repository is organized as follows:

```
/
├── api/              # Node.js API for generating test data.
├── server/           # Node.js server for Stripe payments.
├── src/              # Main Angular application source code.
│   ├── app/
│   │   ├── components/   # Global components (e.g., loader).
│   │   ├── guards/       # Route guards for authentication/authorization.
│   │   ├── services/     # Core services (Auth, Admin, etc.).
│   │   ├── sistemaadmin/ # Admin-facing features.
│   │   ├── sistemaagricultor/ # Farmer-facing features.
│   │   └── sistemacomprador/  # Buyer-facing features.
│   ├── assets/         # Static assets like images and icons.
│   └── environments/   # Environment-specific configurations.
├── angular.json      # Angular project configuration.
├── firebase.json     # Firebase hosting and functions configuration.
└── package.json      # Frontend npm dependencies and scripts.
```