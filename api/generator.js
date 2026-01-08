import { faker } from '@faker-js/faker';

// Configurar locale español
faker.locale = 'es';

// Catálogo de productos basado en assets/vegetales organizados por categorías reales
const PRODUCTOS_ECUADOR = {
  Hojas: ['Apio', 'Col', 'Col Morada', 'Hierbita', 'Lechuga', 'Perejil'],
  Hortalizas: ['Brocoli', 'Coliflor', 'Pepino', 'Tomate', 'Vainita', 'Zuchinni'],
  Tallos: ['Cebolla Blanca', 'Cebolla Colorada', 'Cebolla Perla'],
  Raices: ['Ajo', 'Jengibre', 'Papa', 'Zanahoria'],
  Tuberculos: ['Papa'], // Papa puede estar en ambas
  Bulbos: ['Ajo', 'Cebolla Blanca', 'Cebolla Colorada', 'Cebolla Perla'],
  Frutos: ['Aguacate', 'Coco', 'Durazno', 'Frutilla', 'Guineo', 'Limon', 'Maduro', 'Manzana', 'Manzana Verde', 'Naranja', 'Naranjilla', 'Papaya', 'Pera', 'Pina', 'Pimiento Amarillo', 'Pimiento Rojo', 'Pimiento Verde', 'Reina Claudia', 'Uvas', 'Uvas Verdes'],
  Semillas: [] // No hay semillas en tu carpeta
};

// Las 24 provincias de Ecuador con coordenadas aproximadas (sin tildes para evitar problemas)
const PROVINCIAS_ECUADOR = [
  { name: 'Guayas', lat: -2.1894, lng: -79.8891 },
  { name: 'Pichincha', lat: -0.1807, lng: -78.4678 },
  { name: 'Manabi', lat: -0.9538, lng: -80.7089 },
  { name: 'Los Rios', lat: -1.0186, lng: -79.4608 },
  { name: 'El Oro', lat: -3.2591, lng: -79.9583 },
  { name: 'Esmeraldas', lat: 0.9682, lng: -79.6519 },
  { name: 'Azuay', lat: -2.9001, lng: -79.0059 },
  { name: 'Imbabura', lat: 0.3499, lng: -78.1263 },
  { name: 'Carchi', lat: 0.8118, lng: -77.7174 },
  { name: 'Cotopaxi', lat: -0.9333, lng: -78.6167 },
  { name: 'Chimborazo', lat: -1.6650, lng: -78.6542 },
  { name: 'Tungurahua', lat: -1.2490, lng: -78.6167 },
  { name: 'Bolivar', lat: -1.5938, lng: -79.0007 },
  { name: 'Canar', lat: -2.5588, lng: -78.9375 },
  { name: 'Loja', lat: -3.9939, lng: -79.2042 },
  { name: 'Santo Domingo de los Tsachilas', lat: -0.2521, lng: -79.1753 },
  { name: 'Santa Elena', lat: -2.2267, lng: -80.8583 },
  { name: 'Morona Santiago', lat: -2.3049, lng: -78.1167 },
  { name: 'Napo', lat: -0.9953, lng: -77.8129 },
  { name: 'Pastaza', lat: -1.4884, lng: -78.0031 },
  { name: 'Zamora Chinchipe', lat: -4.0669, lng: -78.9509 },
  { name: 'Sucumbios', lat: 0.0833, lng: -76.8833 },
  { name: 'Orellana', lat: -0.4586, lng: -76.9875 },
  { name: 'Galapagos', lat: -0.9538, lng: -90.9656 }
];

// Nombres de fincas típicas
const NOMBRES_FINCAS = [
  'La Favorita', 'El Paraíso', 'La Esperanza', 'San José',
  'Santa María', 'El Porvenir', 'Las Mercedes', 'La Primavera',
  'El Edén', 'La Aurora', 'Monte Verde', 'Tierra Fértil'
];

/**
 * Genera un producto asociado a un agricultor
 */
function generarProducto(agricultorId, agricultorProvincia) {
  // Filtrar categorías que no estén vacías
  const categoriasDisponibles = Object.keys(PRODUCTOS_ECUADOR).filter(
    cat => PRODUCTOS_ECUADOR[cat].length > 0
  );
  
  const categoria = faker.helpers.arrayElement(categoriasDisponibles);
  const vegetal = faker.helpers.arrayElement(PRODUCTOS_ECUADOR[categoria]);
  
  const unidad = faker.helpers.arrayElement(['g', 'kg', 'lb']);
  
  const fechaCultivado = faker.date.recent({ days: 60 });
  const creationDate = faker.date.recent({ days: 30 });

  return {
    productId: faker.string.alphanumeric(20),
    agricultorId: agricultorId,
    Vegetal: vegetal,
    categoria: {
      clase: categoria
    },
    medida: {
      peso: `${unidad}`
    },
    precio: parseFloat(faker.commerce.price({ min: 0.50, max: 5, dec: 2 })),
    cantidadDisponible: faker.number.int({ min: 5, max: 100 }),
    descripcionCultivo: `${vegetal} cultivado orgánicamente. ${faker.lorem.sentence()}`,
    fechaCultivado: fechaCultivado,
    provincia: {
      state: agricultorProvincia
    },
    creationDate: creationDate
  };
}

/**
 * Función principal que genera agricultores con sus productos
 * Genera 3 agricultores por provincia, cada uno con 5 productos
 */
export function generateAgricultoresConProductos(options) {
  const resultado = [];
  const AGRICULTORES_POR_PROVINCIA = 3;
  const PRODUCTOS_POR_AGRICULTOR = 5;

  // Iterar por cada provincia
  PROVINCIAS_ECUADOR.forEach(provincia => {
    // Generar 3 agricultores por provincia
    for (let i = 0; i < AGRICULTORES_POR_PROVINCIA; i++) {
      const agricultor = generarAgricultorEnProvincia(provincia);
      
      // Generar exactamente 5 productos por agricultor
      const productos = [];
      for (let j = 0; j < PRODUCTOS_POR_AGRICULTOR; j++) {
        productos.push(generarProducto(agricultor.uid, provincia.name));
      }

      resultado.push({
        agricultor,
        productos,
        metadata: {
          totalProductos: productos.length,
          provincia: provincia.name,
          coordenadas: {
            lat: agricultor.latitude,
            lng: agricultor.longitude
          }
        }
      });
    }
  });

  return resultado;
}

/**
 * Genera un agricultor en una provincia específica
 */
function generarAgricultorEnProvincia(provincia) {
  const gender = faker.helpers.arrayElement(['Hombre', 'Mujer']);
  
  // Generar coordenadas cercanas a la provincia (+/- 0.2 grados para mayor precisión)
  const latitude = provincia.lat + faker.number.float({ min: -0.2, max: 0.2, fractionDigits: 6 });
  const longitude = provincia.lng + faker.number.float({ min: -0.2, max: 0.2, fractionDigits: 6 });

  return {
    uid: faker.string.alphanumeric(20),
    fullname: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    emailverificado: faker.datatype.boolean(),
    cellphone: `(593) ${faker.string.numeric(9)}`,
    address: `${faker.location.streetAddress()}, ${provincia.name}, Ecuador`,
    latitude: latitude,
    longitude: longitude,
    fincaname: faker.helpers.arrayElement(NOMBRES_FINCAS),
    descripcionFinca: faker.lorem.sentence({ min: 10, max: 20 }),
    birthday: faker.date.birthdate({ min: 25, max: 70, mode: 'age' }),
    gender: {
      gender: gender
    },
    ads: {
      advertisements: faker.helpers.arrayElement(['Redes Sociales', 'Google', 'Recomendación', 'Otro'])
    },
    onboarding: true,
    creationDate: faker.date.between({ 
      from: '2024-01-01T00:00:00.000Z', 
      to: new Date() 
    })
  };
}