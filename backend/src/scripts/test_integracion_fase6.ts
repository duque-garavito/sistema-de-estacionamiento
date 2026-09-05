import { MovimientoService } from '../modules/movimientos/services/movimiento.service.js';
import { MovimientoRepository } from '../modules/movimientos/repositories/movimiento.repository.js';

interface TestResult {
  num: number;
  prueba: string;
  paso: boolean;
  evidencia: string;
}

async function ejecutarPruebasIntegralesFase6() {
  console.log('===================================================================');
  console.log('🚀 INICIANDO SUITE DE PRUEBAS INTEGRALES FASE 6.2 — VEHÍCULOS');
  console.log('===================================================================\n');

  const resultados: TestResult[] = [];
  const movimientoService = new MovimientoService();

  try {
    // -----------------------------------------------------------------
    // PRUEBA 1 — REGISTRO DE VEHÍCULO Y CONSULTA DE HISTORIAL
    // -----------------------------------------------------------------
    let mov1: any;
    try {
      mov1 = await movimientoService.registrarIngresoVehiculo({
        placa: 'V62-TEST1',
        tipoVehiculo: 'Auto',
        color: 'Blanco',
        marcaModelo: 'Hyundai Accent',
        propietarioDni: '11223344',
        propietarioNombre: 'Cliente FASE6',
      });

      const historialAll = await movimientoService.obtenerHistorialMovimientos();
      const historialFiltrado = await movimientoService.obtenerHistorialMovimientos('V62-TEST1');

      const exito1 = Boolean(
        historialAll.length > 0 &&
        historialFiltrado.length >= 1 &&
        historialFiltrado.some((m) => m.placa === 'V62-TEST1')
      );

      resultados.push({
        num: 1,
        prueba: 'Prueba de Consulta de Historial de Vehículos',
        paso: exito1,
        evidencia: `Historial general: ${historialAll.length} registros. Historial V62-TEST1: ${historialFiltrado.length} registro(s).`,
      });
    } catch (err: any) {
      resultados.push({ num: 1, prueba: 'Prueba Historial Vehículos', paso: false, evidencia: err.message });
    }

    // -----------------------------------------------------------------
    // PRUEBA 2 — CONSULTA INDIVIDUAL POR ID
    // -----------------------------------------------------------------
    try {
      const obtenido = await movimientoService.obtenerMovimientoPorId(mov1.id);
      const exito2 = Boolean(
        obtenido &&
        obtenido.id === mov1.id &&
        obtenido.placa === 'V62-TEST1' &&
        obtenido.propietarioNombre === 'Cliente FASE6'
      );

      resultados.push({
        num: 2,
        prueba: 'Prueba Consulta por ID de Movimiento',
        paso: exito2,
        evidencia: `Obtenido ID ${obtenido?.id} con placa ${obtenido?.placa} y DNI ${obtenido?.propietarioDni}`,
      });
    } catch (err: any) {
      resultados.push({ num: 2, prueba: 'Prueba Consulta por ID', paso: false, evidencia: err.message });
    }

    // -----------------------------------------------------------------
    // PRUEBA 3 — EDICIÓN DE INFORMACIÓN INFORMATIVA (SIN ALTERAR FINANZAS)
    // -----------------------------------------------------------------
    try {
      const tarifaAntes = mov1.tarifaDiaAplicada;
      const momentoPagoAntes = mov1.momentoPago;

      const actualizado = await movimientoService.actualizarInfoMovimiento(mov1.id, {
        color: 'Negro Azabache',
        marcaModelo: 'Hyundai Accent 2024',
        propietarioNombre: 'Cliente FASE6 Editado',
        observaciones: 'Cliente VIP - Descuento frecuente',
      });

      const exito3 = Boolean(
        actualizado &&
        actualizado.color === 'Negro Azabache' &&
        actualizado.marcaModelo === 'Hyundai Accent 2024' &&
        actualizado.propietarioNombre === 'Cliente FASE6 Editado' &&
        actualizado.observaciones === 'Cliente VIP - Descuento frecuente' &&
        actualizado.tarifaDiaAplicada === tarifaAntes && // Preservado snapshot
        actualizado.momentoPago === momentoPagoAntes // Preservado momento de pago
      );

      resultados.push({
        num: 3,
        prueba: 'Prueba Edición Informativa de Vehículo (Mantiene snapshot financiero)',
        paso: exito3,
        evidencia: `Marca/Modelo editado a "${actualizado.marcaModelo}". Snapshot tarifa preservado en S/ ${actualizado.tarifaDiaAplicada}`,
      });
    } catch (err: any) {
      resultados.push({ num: 3, prueba: 'Prueba Edición Informativa', paso: false, evidencia: err.message });
    }

    // -----------------------------------------------------------------
    // PRUEBA 4 — HISTORIAL DE VISITAS MÚLTIPLES POR PLACA
    // -----------------------------------------------------------------
    try {
      // Completar salida de la primera visita
      await movimientoService.registrarSalidaVehiculo({ movimientoId: mov1.id });

      // Registrar una segunda visita para la misma placa V62-TEST1
      const mov2 = await movimientoService.registrarIngresoVehiculo({
        placa: 'V62-TEST1',
        tipoVehiculo: 'Auto',
        color: 'Negro Azabache',
        momentoPago: 'SALIDA',
      });

      const visitasCompletas = await movimientoService.obtenerHistorialMovimientos('V62-TEST1');
      const exito4 = (visitasCompletas.length === 2);

      resultados.push({
        num: 4,
        prueba: 'Prueba Visitas Múltiples por Placa (Historial acumulado)',
        paso: exito4,
        evidencia: `Placa V62-TEST1 cuenta con ${visitasCompletas.length} registros en su historial de visitas acumulado.`,
      });

      // Limpieza de segunda visita
      await movimientoService.registrarSalidaVehiculo({ movimientoId: mov2.id });
    } catch (err: any) {
      resultados.push({ num: 4, prueba: 'Prueba Visitas Múltiples', paso: false, evidencia: err.message });
    }

    // -----------------------------------------------------------------
    // LIMPIEZA DE REGISTROS V62-*
    // -----------------------------------------------------------------
    console.log('\n🧹 Limpiando registros de prueba V62-*...');
    (MovimientoRepository as any).memoryStore = ((MovimientoRepository as any).memoryStore || []).filter(
      (m: any) => !m.placa.startsWith('V62-')
    );
    console.log('✅ Datos de prueba V62-* eliminados correctamente.');

  } catch (globalErr: any) {
    console.error('❌ Error global en ejecución de pruebas FASE 6.2:', globalErr);
  }

  console.log('\n===================================================================');
  console.log('📊 RESUMEN FINAL DE PRUEBAS INTEGRALES FASE 6.2');
  console.log('===================================================================');
  let fallos = 0;
  resultados.forEach((r) => {
    if (!r.paso) fallos++;
    console.log(`${r.paso ? '✅ PASS' : '❌ FAIL'} | #${r.num} ${r.prueba} -> ${r.evidencia}`);
  });

  console.log('\n-------------------------------------------------------------------');
  console.log(`TOTAL PRUEBAS: ${resultados.length} | PASARON: ${resultados.length - fallos} | FALLARON: ${fallos}`);
  console.log('-------------------------------------------------------------------\n');

  if (fallos > 0) {
    process.exit(1);
  }
}

ejecutarPruebasIntegralesFase6();
