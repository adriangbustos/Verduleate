# 🌱 Verduleate Data Generator API

API para generar datos de prueba de agricultores y productos para el sistema Verduleate.

## 🚀 Instalación

```bash
cd data-generator
npm install
```

## 🏃 Uso

### Iniciar el servidor
```bash
npm start
```

### Modo desarrollo (con auto-reload)
```bash
npm run dev
```

El servidor correrá en: `http://localhost:3001`

## 📡 Endpoints

### POST `/api/generate`
Genera agricultores con productos personalizados.

**Body:**
```json
{
  "numAgricultores": 10,
  "minProductos": 3,
  "maxProductos": 8
}
```

**Ejemplo con curl:**
```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d "{\"numAgricultores\": 5, \"minProductos\": 2, \"maxProductos\": 6}"
```

### GET `/api/generate/:count`
Genera rápidamente N agricultores (3-8 productos cada uno).

**Ejemplo:**
```bash
curl http://localhost:3001/api/generate/10
```

## 📦 Estructura de Datos

### Agricultor
```json
{
  "uid": "2RrwoWXLaNdaO39TzwXHJz1ioA3",
  "fullname": "Adrián Garrido",
  "email": "adriangbustos8@gmail.com",
  "emailverificado": true,
  "cellphone": "(593) 982371526",
  "address": "Puerto Seymour, Guayaquil, Guayas, 090901, Ecuador",
  "latitude": -2.145678,
  "longitude": -79.923456,
  "fincaname": "La Favorita",
  "descripcionFinca": "Lorem ipsum dolor sit amet...",
  "birthday": "1994-08-09T12:00:00.000Z",
  "gender": { "gender": "Hombre" },
  "ads": { "advertisements": "Redes Sociales" },
  "onboarding": true,
  "creationDate": "2025-04-15T11:52:49.000Z"
}
```

### Producto
```json
{
  "productId": "9TxnohpLu4GG5iq2BuxE",
  "agricultorId": "2RrwoWXLaNdaO39TzwXHJz1ioA3",
  "Vegetal": "Pera",
  "categoria": { "clase": "Tallos" },
  "medida": { "peso": "g" },
  "precio": 0.04,
  "cantidadDisponible": 3,
  "descripcionCultivo": "awdawdawdawdawdawdawdawdawdawdawdawda",
  "fechaCultivado": "2025-05-17T12:00:00.000Z",
  "provincia": { "state": "Carchi" },
  "creationDate": "2025-05-18T09:13:14.000Z"
}
```

## ✨ Características

- ✅ Genera datos realistas con Faker.js
- ✅ Coordenadas GPS (`latitude`, `longitude`) cercanas a provincias ecuatorianas
- ✅ Productos ecuatorianos auténticos por categoría
- ✅ Relación consistente agricultor → productos
- ✅ Provincias de Ecuador con ubicaciones reales
- ✅ Nombres de fincas típicos
- ✅ Fechas coherentes
- ✅ API REST lista para usar

## 🗺️ Provincias Soportadas

Guayas, Pichincha, Manabí, Los Ríos, El Oro, Esmeraldas, Azuay, Imbabura, Carchi, Cotopaxi

## 🌾 Categorías de Productos

- **Tallos**: Cebolla, Puerro, Apio, Espárrago, Palmito
- **Raíces**: Papa, Yuca, Zanahoria, Remolacha, Jengibre
- **Frutas**: Banano, Papaya, Mora, Naranjilla, Guanábana, Maracuyá
- **Hojas**: Lechuga, Acelga, Espinaca, Col, Albahaca
- **Tubérculos**: Camote, Melloco, Oca, Mashua
- **Legumbres**: Fréjol, Arveja, Habas, Lenteja
