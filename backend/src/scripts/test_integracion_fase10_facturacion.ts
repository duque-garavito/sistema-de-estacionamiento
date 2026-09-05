import { dbPool } from '../core/config/database.js';
import { FacturacionService } from '../modules/facturacion/services/facturacion.service.js';
import { CpeBuilderService } from '../modules/facturacion/services/cpe-builder.service.js';
import { MockFiscalProvider } from '../modules/facturacion/providers/mock-fiscal.provider.js';

async function testAuditoriaFiscalFase10() {
  console.log('----------------------------------------------------');
  console.log('🧪 AUDITORÍA Y PRUEBAS DEL MOTOR FISCAL (FASE 10.2.1)');
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

  // 1. Prueba de Cálculo de Impuestos (Base + 18% IGV)
  console.log('\n📌 1. Auditoría de Cálculo de Impuestos y Redondeos:');
  const calc10 = CpeBuilderService.calcularImpuestos(10.00);
  assert(calc10.opGravadas === 8.47, `Monto 10.00 -> Base S/ 8.47 (Obtenido: ${calc10.opGravadas})`);
  assert(calc10.igv === 1.53, `Monto 10.00 -> IGV S/ 1.53 (Obtenido: ${calc10.igv})`);
  assert(Number((calc10.opGravadas + calc10.igv).toFixed(2)) === 10.00, 'Suma Base + IGV es exactamente 10.00');

  const calc15_5 = CpeBuilderService.calcularImpuestos(15.50);
  assert(calc15_5.opGravadas === 13.14, `Monto 15.50 -> Base S/ 13.14 (Obtenido: ${calc15_5.opGravadas})`);
  assert(calc15_5.igv === 2.36, `Monto 15.50 -> IGV S/ 2.36 (Obtenido: ${calc15_5.igv})`);
  assert(Number((calc15_5.opGravadas + calc15_5.igv).toFixed(2)) === 15.50, 'Suma Base + IGV es exactamente 15.50');

  // 2. Prueba de Emisión de Boleta
  console.log('\n📌 2. Emisión de Boleta de Venta (Tipo 03):');
  const service = new FacturacionService();
  const dtoBoleta = {
    movimientoId: 9901,
    tipoComprobante: '03' as const,
    clienteTipoDoc: '1' as const,
    clienteNumDoc: '45678901',
    clienteNombre: 'JUAN PEREZ',
    total: 10.00,
    metodoPago: 'Efectivo',
    usuarioId: 1,
  };

  try {
    const boleta = await service.emitirComprobante(dtoBoleta);
    assert(boleta.id > 0, `Boleta emitida con ID: ${boleta.id}`);
    assert(boleta.serie === 'B001', `Serie asignada B001 (Obtenido: ${boleta.serie})`);
    assert(boleta.correlativo > 0, `Correlativo asignado: ${boleta.correlativo}`);
    assert(boleta.estadoSunat === 'ACEPTADO', `Estado SUNAT: ${boleta.estadoSunat}`);
    assert(!!boleta.digestValue, `DigestValue generado: ${boleta.digestValue?.substring(0, 15)}...`);
    
    // Validar Formato QR RS 113-2018
    const partsQR = boleta.codigoQr?.split('|') || [];
    assert(partsQR.length === 10, `Estructura QR tiene 10 campos separados por pipe (Obtenidos: ${partsQR.length})`);
    assert(partsQR[0] === '20123456789', `QR Campo 1 RUC Emisor: ${partsQR[0]}`);
    assert(partsQR[1] === '03', `QR Campo 2 Tipo Doc: ${partsQR[1]}`);
    assert(partsQR[2] === boleta.serie, `QR Campo 3 Serie: ${partsQR[2]}`);
    assert(partsQR[3] === String(boleta.correlativo), `QR Campo 4 Correlativo: ${partsQR[3]}`);
    assert(partsQR[4] === '1.53', `QR Campo 5 IGV: ${partsQR[4]}`);
    assert(partsQR[5] === '10.00', `QR Campo 6 Total: ${partsQR[5]}`);

    // 3. Prueba de Restricción de Alcance Fiscal (Factura 01 Deshabilitada)
    console.log('\n📌 3. Verificación de Restricción de Alcance (Factura 01 Deshabilitada):');
    try {
      await service.emitirComprobante({
        movimientoId: 9902,
        tipoComprobante: '01' as any,
        clienteTipoDoc: '6',
        clienteNumDoc: '20601234567',
        clienteNombre: 'EMPRESA SAC',
        total: 50.00,
        metodoPago: 'Yape',
        usuarioId: 1,
      });
      assert(false, 'Debió rechazar la emisión de Factura 01');
    } catch (e: any) {
      assert(e.message.includes('no está habilitado'), 'Rechaza la emisión de Factura 01 según alcance FASE 10.3');
    }

    // 4. Prueba de Validaciones SUNAT de Cliente
    console.log('\n📌 4. Auditoría de Validaciones de Cliente (DNI / RUC):');
    try {
      CpeBuilderService.validarCliente({
        tipoComprobante: '01',
        clienteTipoDoc: '1', // Error: DNI en Factura
        clienteNumDoc: '12345678',
        total: 10,
      } as any);
      assert(false, 'Debió rechazar Factura con DNI');
    } catch (e: any) {
      assert(e.message.includes('RUC (6)'), 'Factura rechaza cliente sin RUC');
    }

    try {
      CpeBuilderService.validarCliente({
        tipoComprobante: '01',
        clienteTipoDoc: '6',
        clienteNumDoc: '1234', // Error: RUC corto
        clienteNombre: 'EMPRESA SAC',
        total: 10,
      } as any);
      assert(false, 'Debió rechazar Factura con RUC inválido');
    } catch (e: any) {
      assert(e.message.includes('11 dígitos'), 'Factura rechaza RUC que no tiene 11 dígitos');
    }

    try {
      CpeBuilderService.validarCliente({
        tipoComprobante: '03',
        clienteTipoDoc: '1',
        clienteNumDoc: '1234', // Error: DNI de 4 dígitos
        total: 10,
      } as any);
      assert(false, 'Debió rechazar DNI inválido');
    } catch (e: any) {
      assert(e.message.includes('8 dígitos'), 'Boleta rechaza DNI que no tiene 8 dígitos');
    }

    // 5. Prueba de Idempotencia y Reintento
    console.log('\n📌 5. Auditoría de Idempotencia y Reintento:');
    const reintento = await service.reintentarEnvio(boleta.id);
    assert(reintento?.id === boleta.id, 'El reintento conserva el mismo ID de comprobante');
    assert(reintento?.serie === boleta.serie, 'El reintento conserva la misma Serie');
    assert(reintento?.correlativo === boleta.correlativo, 'El reintento NO quemó un nuevo correlativo');

    // 6. Prueba de Manejo de Fallas / Modo Contingencia
    console.log('\n📌 6. Simulación de Falla Fiscal (Modo Contingencia):');
    // Creamos una instancia con un MockProvider que simula error de conexión
    class FailingFiscalProvider extends MockFiscalProvider {
      async emitir(): Promise<any> {
        throw new Error('Timeout de conexión con SUNAT / OSE');
      }
    }

    service.setProvider(new FailingFiscalProvider());

    const dtoContingencia = {
      movimientoId: 9903,
      tipoComprobante: '03' as const,
      clienteTipoDoc: '1' as const,
      clienteNumDoc: '11223344',
      clienteNombre: 'MARIA LOPEZ',
      total: 20.00,
      metodoPago: 'Efectivo',
      usuarioId: 1,
    };

    const cpeContingencia = await service.emitirComprobante(dtoContingencia);
    assert(cpeContingencia.estadoSunat === 'PENDIENTE', `Falla de red coloca estado PENDIENTE (Obtenido: ${cpeContingencia.estadoSunat})`);
    assert(cpeContingencia.mensajeRespuestaSunat?.includes('Modo Contingencia') === true, 'Mensaje registra contingencia adecuadamente');

  } catch (error: any) {
    console.error('Error durante la ejecución del test:', error);
    testsFailed++;
  }

  console.log('\n----------------------------------------------------');
  console.log(`📊 RESUMEN FASE 10.2.1: ${testsPassed} Pasaron | ${testsFailed} Fallaron`);
  console.log('----------------------------------------------------');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

testAuditoriaFiscalFase10();
