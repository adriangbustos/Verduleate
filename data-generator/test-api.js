// Script para probar la API localmente sin necesidad de curl

async function testAPI() {
  console.log('🧪 Probando API de generación de datos...\n');

  try {
    // Test 1: Generar 2 agricultores
    console.log('📊 Test 1: GET /api/generate/2');
    const response1 = await fetch('http://localhost:3001/api/generate/2');
    const data1 = await response1.json();
    
    console.log(`✅ Generados: ${data1.total} agricultores`);
    console.log(`📍 Primer agricultor: ${data1.data[0].agricultor.fullname}`);
    console.log(`   Provincia: ${data1.data[0].metadata.provincia}`);
    console.log(`   Coordenadas: ${data1.data[0].metadata.coordenadas.lat}, ${data1.data[0].metadata.coordenadas.lng}`);
    console.log(`   Productos: ${data1.data[0].metadata.totalProductos}\n`);

    // Test 2: Generar con parámetros custom
    console.log('📊 Test 2: POST /api/generate (custom)');
    const response2 = await fetch('http://localhost:3001/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numAgricultores: 3,
        minProductos: 5,
        maxProductos: 10
      })
    });
    const data2 = await response2.json();
    
    console.log(`✅ Generados: ${data2.total} agricultores`);
    data2.data.forEach((item, i) => {
      console.log(`   ${i + 1}. ${item.agricultor.fullname} - ${item.metadata.totalProductos} productos`);
    });

    console.log('\n✨ Todos los tests pasaron exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Asegúrate de que el servidor esté corriendo con: npm start');
  }
}

testAPI();
