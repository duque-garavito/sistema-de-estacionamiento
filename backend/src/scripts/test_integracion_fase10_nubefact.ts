import { dbPool } from '../core/config/database.js';
import { FacturacionService } from '../modules/facturacion/services/facturacion.service.js';
import { NubefactFiscalProvider } from '../modules/facturacion/providers/nubefact-fiscal.provider.js';

async function testNubefactBoletaFase10_3() {
  console.log('----------------------------------------------------');
  console.log('🧪 PRUEBAS FASE 10.3: BOLETA ELECTRÓNICA CON NUBEFACT SANDBOX');
  console.log('----------------------------------------------------');

  let testsPassed = 0;
  let testsFailed = 0;

  function assert(condition: boolean, description: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${description}`);
      testsPassed++;
    } else {
      console.error(`  ❌ [FAIL] ${description}`);
      testsFailed++;
    }
  }

  const service = new FacturacionService();
  service.setProvider(new NubefactFiscalProvider());

  // 1. Prueba de Restricción: Intentar emitir Factura (01) debe rebotar
  console.log('\n📌 1. Verificación de Restricción de Alcance (Factura Deshabilitada):');
  try {
    await service.emitirComprobante({
      movimientoId: 8801,
      tipoComprobante: '01' as any, // Factura
      clienteTipoDoc: '6',
      clienteNumDoc: '20601234567',
      clienteNombre: 'EMPRESA SAC',
      total: 50.00,
      metodoPago: 'Efectivo',
    });
    assert(false, 'Debió rechazar la emisión de Factura');
  } catch (err: any) {
    assert(err.message.includes('no está habilitado'), 'Rechaza correctamente la solicitud de Factura 01');
  }

  // 2. Emisión Exitosa de Boleta de Venta (03) a NubeFact Sandbox
  console.log('\n📌 2. Emisión de Boleta Electrónica (03 - Serie B001) a NubeFact:');
  const dtoBoleta = {
    movimientoId: 8802,
    tipoComprobante: '03' as const,
    clienteTipoDoc: '1' as const,
    clienteNumDoc: '45678901',
    clienteNombre: 'CARLOS ALVAREZ',
    total: 15.00,
    metodoPago: 'Efectivo',
    usuarioId: 1,
  };

  try {
    const boleta = await service.emitirComprobante(dtoBoleta);
    assert(boleta.id > 0, `Boleta creada con ID: ${boleta.id}`);
    assert(boleta.tipoComprobante === '03', 'Tipo de comprobante es 03 (Boleta)');
    assert(boleta.serie === 'B001', `Serie asignada: ${boleta.serie}`);
    assert(boleta.correlativo > 0, `Correlativo asignado: ${boleta.correlativo}`);
    assert(boleta.estadoSunat === 'ACEPTADO', `Estado SUNAT/OSE: ${boleta.estadoSunat}`);
    assert(!!boleta.digestValue, `DigestValue (Hash XML) obtenido: ${boleta.digestValue?.substring(0, 15)}...`);
    assert(!!boleta.codigoQr, 'Cadena QR obtenida exitosamente');
    assert(boleta.opGravadas === 12.71, `Base Imponible S/ 12.71 (Obtenida: ${boleta.opGravadas})`);
    assert(boleta.igv === 2.29, `IGV 18% S/ 2.29 (Obtenido: ${boleta.igv})`);
    assert(boleta.total === 15.00, 'Total S/ 15.00');

    // 3. Verificación de Independencia del Ticket de Cochera
    console.log('\n📌 3. Verificación de Independencia del Ticket Interno:');
    assert(boleta.movimientoId === 8802, 'Boleta asociada correctamente a movimiento_id');

  } catch (error: any) {
    console.error('Error durante la ejecución del test:', error);
    testsFailed++;
  }

  console.log('\n----------------------------------------------------');
  console.log(`📊 RESUMEN FASE 10.3: ${testsPassed} Pasaron | ${testsFailed} Fallaron`);
  console.log('----------------------------------------------------');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

testNubefactBoletaFase10_3();
