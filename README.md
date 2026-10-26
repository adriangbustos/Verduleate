# Verduleate 🥬

[![Live Demo](https://img.shields.io/badge/Live_Demo-Access_Platform-blue?style=for-the-badge&logo=netlify)](#)

A digital agricultural marketplace connecting Ecuadorian smallholder farmers directly with local consumers, eliminating intermediaries to ensure fair trade and fresh produce access.

![Verduleate Marketplace Preview](src/assets/preview.png)

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

## Key Capabilities

### 👨‍🌾 For Farmers & Growers (`sistema-agricultor`)
- **Producer Onboarding:** Guided registration and farm profile configuration.
- **Harvest & Inventory Management:** Add, edit, and catalog farm yields with pricing per pound/quintal, stock levels, and crop photos.
- **Geolocation:** Plot farmlands on geographic maps to optimize local distribution and buyer proximity.
- **Sales Analytics:** Manage incoming orders, fulfillment dispatches, and payout balances.

### 🛒 For Consumers & Buyers (`sistema-comprador`)
- **Interactive Farm Map:** Interactive Leaflet map explorer to discover nearby farms and local harvest points.
- **Freshness Catalog:** Smart filtering across greens, root vegetables, fruits, legumes, and organic goods.
- **Cart & Secure Checkout:** Seamless shopping cart with integrated Stripe payments.
- **Order Tracking:** Real-time visibility into order status from field harvest to doorstep delivery.

### 🛡️ For Administrators (`sistema-admin`)
- **Central Dashboard:** Monitor transaction volume, active agricultural sellers, and customer fulfillment.
- **Customer Support:** Real-time messaging and inquiry channel between buyers and platform admins.

---

## Project Structure

```
VERDULEATE/
├── src/
│   ├── app/
│   │   ├── landingpage/         # Public discovery portal and showcase
│   │   ├── sistema-agricultor/  # Farm administration portal for producers
│   │   ├── sistema-comprador/   # Cart, farm maps, and order tracking for buyers
│   │   ├── sistema-admin/       # Platform oversight and user management
│   │   └── services/            # Firebase Auth, Firestore, and Stripe payment services
│   ├── assets/                  # Icons, vector graphics, and previews
│   │   └── preview.png          # Marketplace landing screenshot preview
│   └── environments/            # Firebase credentials and environment config
└── angular.json                 # Angular CLI build configuration
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Installation
```bash
# Clone the repository
git clone https://github.com/adriangbustos/Verduleate.git
cd Verduleate

# Install dependencies
npm install

# Start development server
ng serve
```
Open `http://localhost:4200` in your web browser.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
