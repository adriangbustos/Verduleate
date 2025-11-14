import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

// Configuración de Firebase (usando el SDK web, no Admin)
const firebaseConfig = {
  apiKey: "AIzaSyC0GIlssVm0jsFRaRLyrzmwAS3WSrcJ5so",
  authDomain: "verduleate-4e5c0.firebaseapp.com",
  projectId: "verduleate-4e5c0",
  storageBucket: "verduleate-4e5c0.firebasestorage.app",
  messagingSenderId: "337862343335",
  appId: "1:337862343335:web:82ec306acef5c4fb5e7982"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Inserta un agricultor en Firestore
 */
export async function insertAgricultor(agricultor) {
  const docRef = doc(db, 'agricultores', agricultor.uid);
  await setDoc(docRef, agricultor);
  return agricultor.uid;
}

/**
 * Inserta un producto en Firestore
 */
export async function insertProducto(producto) {
  const docRef = doc(db, 'productos', producto.productId);
  await setDoc(docRef, producto);
  return producto.productId;
}

/**
 * Inserta un agricultor con todos sus productos
 */
export async function insertAgricultorConProductos(data) {
  const { agricultor, productos } = data;
  
  // Insertar agricultor
  await insertAgricultor(agricultor);
  
  // Insertar todos los productos
  const productosInsertados = await Promise.all(
    productos.map(producto => insertProducto(producto))
  );
  
  return {
    agricultorId: agricultor.uid,
    productosIds: productosInsertados
  };
}

/**
 * Inserta múltiples agricultores con sus productos
 */
export async function insertMultiple(agricultoresConProductos) {
  const resultados = [];
  
  for (const item of agricultoresConProductos) {
    const resultado = await insertAgricultorConProductos(item);
    resultados.push(resultado);
  }
  
  return resultados;
}

export default db;
