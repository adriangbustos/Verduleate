import express from 'express';
import cors from 'cors';
import { generateAgricultoresConProductos } from './generator.js';
import { insertMultiple, insertAgricultorConProductos } from './firebase-config.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Endpoint principal - Genera 3 agricultores por provincia (30 total) con 5 productos c/u
app.post('/api/generate', async (req, res) => {
  try {
    const { 
      saveToFirestore = true  // Por defecto guarda en Firestore
    } = req.body;

    // Genera 3 agricultores x 10 provincias = 30 agricultores, 5 productos c/u
    const data = generateAgricultoresConProductos({});

    let firestoreResults = null;
    if (saveToFirestore) {
      console.log(`🔥 Guardando ${data.length} agricultores (3 por provincia) en Firestore...`);
      firestoreResults = await insertMultiple(data);
      console.log(`✅ Guardado completado!`);
    }

    res.json({
      success: true,
      total: data.length,
      totalProductos: data.reduce((sum, item) => sum + item.productos.length, 0),
      savedToFirestore: saveToFirestore,
      firestoreResults,
      data
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint simple - Genera TODO (30 agricultores, 150 productos) y guarda
app.get('/api/generate', async (req, res) => {
  try {
    // Genera 3 agricultores x 10 provincias = 30 agricultores, 5 productos c/u
    const data = generateAgricultoresConProductos({});

    console.log(`🔥 Guardando ${data.length} agricultores (3 por provincia) en Firestore...`);
    const firestoreResults = await insertMultiple(data);
    console.log(`✅ Guardado completado!`);

    res.json({
      success: true,
      total: data.length,
      totalProductos: data.reduce((sum, item) => sum + item.productos.length, 0),
      savedToFirestore: true,
      summary: data.map(item => ({
        agricultor: item.agricultor.fullname,
        provincia: item.metadata.provincia,
        productos: item.metadata.totalProductos,
        coordenadas: item.metadata.coordenadas
      })),
      firestoreResults
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🌱 Data Generator API corriendo en http://localhost:${PORT}`);
  console.log(`📍 Endpoints disponibles:`);
  console.log(`   POST http://localhost:${PORT}/api/generate`);
  console.log(`   GET  http://localhost:${PORT}/api/generate/:count`);
});
