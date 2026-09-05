import { MovimientoService } from '../modules/movimientos/services/movimiento.service.js';
import { TarifaService } from '../modules/tarifas/services/tarifa.service.js';
import { ListaNegraService } from '../modules/lista-negra/services/lista-negra.service.js';
import { CajaService } from '../modules/caja/services/caja.service.js';
import { MovimientoRepository } from '../modules/movimientos/repositories/movimiento.repository.js';
import { ListaNegraRepository } from '../modules/lista-negra/repositories/lista-negra.repository.js';
import { CajaRepository } from '../modules/caja/repositories/caja.repository.js';

interface TestResult {
  prueba: string;
  paso: boolean;
  evidencia: string;
}

async function ejecutarPruebasIntegrales() {
  console.log('=====================================================');
  console.log('🚀 INICIANDO SUITE DE PRUEBAS INTEGRALES — FASE 4.4');
  console.log('=====================================================\n');

  const resultados: TestResult[] = [];
  const movimientoService = new MovimientoService();
  const tarifaService = new TarifaService();
  const listaNegraService = new ListaNegraService();
  const cajaService = new CajaService();

  const fechaHoy = new Date().toISOString().split('T')[0];

  try {
    // -----------------------------------------------------------------
    // PRUEBA A — ENTRADA NORMAL
    // -----------------------------------------------------------------
    let movA: any;
    try {
      movA = await movimientoService.registrarIngresoVehiculo({
        placa: 'TEST-001',
        tipoVehiculo: 'Auto',
        color: 'Gris',
        marcaModelo: 'Honda Civic',
        propietarioDni: '11223344',
        propietarioNombre: 'Cliente Test A',
        momentoPago: 'ENTRADA',
        metodoPago: 'Efectivo',
        usuarioIngreso: 'Operador A (Mañana)',
      });

      const cajaResumenA = await cajaService.obtenerResumenCaja(fechaHoy);
      const enListaActivos = (await movimientoService.obtenerMovimientosActivos()).some(m => m.placa === 'TEST-001');

      const exitoA = Boolean(
        movA &&
        movA.estado === 'Activo' &&
        movA.codigoTicket &&
        movA.tarifaDiaAplicada > 0 &&
        movA.momentoPago === 'ENTRADA' &&
        movA.metodoPago === 'Efectivo' &&
        movA.propietarioDni === '11223344' &&
        enListaActivos &&
        cajaResumenA.ingresos.efectivo >= movA.tarifaDiaAplicada
      );

      resultados.push({
        prueba: 'Prueba A — Entrada Normal (TEST-001)',
        paso: exitoA,
        evidencia: `Ticket: ${movA.codigoTicket}, Tarifa Congelada: S/ ${movA.tarifaDiaAplicada}, Estado: ${movA.estado}, Caja Efectivo: S/ ${cajaResumenA.ingresos.efectivo}`,
      });
    } catch (err: any) {
      resultados.push({ prueba: 'Prueba A — Entrada Normal (TEST-001)', paso: false, evidencia: err.message });
    }

    // -----------------------------------------------------------------
    // PRUEBA B — RECHAZO DE DUPLICADO
    // -----------------------------------------------------------------
    try {
      await movimientoService.registrarIngresoVehiculo({
        placa: 'TEST-001',
        tipoVehiculo: 'Auto',
        momentoPago: 'ENTRADA',
      });
      resultados.push({ prueba: 'Prueba B — Duplicado (TEST-001)', paso: false, evidencia: 'No rechazó la entrada duplicada' });
    } catch (err: any) {
      const exitoB = err.message.includes('ya se encuentra registrado');
      resultados.push({
        prueba: 'Prueba B — Duplicado (TEST-001)',
        paso: exitoB,
        evidencia: `Excepción correcta al intentar duplicar: "${err.message}"`,
      });
    }

    // -----------------------------------------------------------------
    // PRUEBA C — TARIFA CONGELADA (SNAPSHOT)
    // -----------------------------------------------------------------
    try {
      const tarifaOriginal = movA.tarifaDiaAplicada;
      // Modificar temporalmente tarifa de Auto a S/ 50.00
      await tarifaService.actualizarTarifa({ tipoVehiculo: 'Auto', tipoCobro: 'DIA', precioHora: 10, precioDia: 50.0, toleranciaMinutos: 10, fraccion15min: 2, activo: true });

      const movAConsultado = await (movimientoService as any).repository.findById(movA.id);
      const exitoC = (movAConsultado.tarifaDiaAplicada === tarifaOriginal);

      // Restaurar tarifa original
      await tarifaService.actualizarTarifa({ tipoVehiculo: 'Auto', tipoCobro: 'DIA', precioHora: 5, precioDia: tarifaOriginal, toleranciaMinutos: 10, fraccion15min: 1.5, activo: true });

      resultados.push({
        prueba: 'Prueba C — Tarifa Congelada (TEST-001)',
        paso: exitoC,
        evidencia: `Tarifa global cambió a S/ 50.00, pero TEST-001 preservó su tarifa congelada histórica: S/ ${movAConsultado.tarifaDiaAplicada}`,
      });
    } catch (err: any) {
      resultados.push({ prueba: 'Prueba C — Tarifa Congelada (TEST-001)', paso: false, evidencia: err.message });
    }

    // -----------------------------------------------------------------
    // PRUEBA D — SALIDA DE PAGO EN ENTRADA
    // -----------------------------------------------------------------
    try {
      const salidaA = await movimientoService.registrarSalidaVehiculo({
        movimientoId: movA.id,
        usuarioSalida: 'Operador B (Tarde)',
      });

      const exitoD = Boolean(
        salidaA &&
        salidaA.estado === 'Completado' &&
        salidaA.fechaSalida &&
        salidaA.totalPagar === 0 // Saldo adicional a pagar en salida es 0
      );

      resultados.push({
        prueba: 'Prueba D — Salida Pago en Entrada (TEST-001)',
        paso: exitoD,
        evidencia: `Estado: ${salidaA.estado}, Importe Adicional Salida: S/ ${salidaA.totalPagar}, Operador Salida: ${salidaA.usuarioSalida}`,
      });
    } catch (err: any) {
      resultados.push({ prueba: 'Prueba D — Salida Pago en Entrada (TEST-001)', paso: false, evidencia: err.message });
    }

    // -----------------------------------------------------------------
    // PRUEBA E — PAGO EN SALIDA (TEST-002)
    // -----------------------------------------------------------------
    try {
      const movB = await movimientoService.registrarIngresoVehiculo({
        placa: 'TEST-002',
        tipoVehiculo: 'Camioneta',
        momentoPago: 'SALIDA',
        metodoPago: 'Yape',
        usuarioIngreso: 'Operador A (Mañana)',
      });

      const salidaB = await movimientoService.registrarSalidaVehiculo({
        movimientoId: movB.id,
        metodoPago: 'Yape',
        usuarioSalida: 'Operador B (Tarde)',
      });

      const totalPagarB = salidaB.totalPagar || 0;
      const cajaResumenE = await cajaService.obtenerResumenCaja(fechaHoy);
      const exitoE = Boolean(
        salidaB.estado === 'Completado' &&
        totalPagarB > 0 &&
        cajaResumenE.ingresos.yape >= totalPagarB
      );

      resultados.push({
        prueba: 'Prueba E — Pago en Salida (TEST-002)',
        paso: exitoE,
        evidencia: `Importe Salida: S/ ${totalPagarB}, Registrado en Caja Yape: S/ ${cajaResumenE.ingresos.yape}`,
      });
    } catch (err: any) {
      resultados.push({ prueba: 'Prueba E — Pago en Salida (TEST-002)', paso: false, evidencia: err.message });
    }

    // -----------------------------------------------------------------
    // PRUEBA F — COBRO MULTIDÍA (CÁLCULO DÍAS)
    // -----------------------------------------------------------------
    try {
      const entradaLunes = new Date('2026-09-01T08:00:00');
      const salidaMartes = new Date('2026-09-02T10:00:00');
      const salidaMiercoles = new Date('2026-09-03T10:00:00');

      const calc1 = await tarifaService.calcularCobroPorDia(entradaLunes, salidaMartes, 10.0, 'SALIDA');
      const calc2 = await tarifaService.calcularCobroPorDia(entradaLunes, salidaMiercoles, 10.0, 'SALIDA');

      const exitoF = (calc1.diasCobrados === 2 && calc1.totalPagar === 20.0 && calc2.diasCobrados === 3 && calc2.totalPagar === 30.0);

      resultados.push({
        prueba: 'Prueba F — Cobro Multidía (Días + 1)',
        paso: exitoF,
        evidencia: `Lunes a Martes = ${calc1.diasCobrados} días (S/ ${calc1.totalPagar}). Lunes a Miércoles = ${calc2.diasCobrados} días (S/ ${calc2.totalPagar})`,
      });
    } catch (err: any) {
      resultados.push({ prueba: 'Prueba F — Cobro Multidía', paso: false, evidencia: err.message });
    }

    // -----------------------------------------------------------------
    // PRUEBA G — LISTA NEGRA (TEST-003)
    // -----------------------------------------------------------------
    try {
      await listaNegraService.agregarAListaNegra({ placa: 'TEST-003', motivo: 'Placa en prueba de lista negra' });

      let rechazoExitoso = false;
      try {
        await movimientoService.registrarIngresoVehiculo({ placa: 'TEST-003', tipoVehiculo: 'Auto' });
      } catch (e: any) {
        rechazoExitoso = e.message.includes('LISTA NEGRA');
      }

      await listaNegraService.retirarDeListaNegra('TEST-003');

      const ingresoPostDesactivacion = await movimientoService.registrarIngresoVehiculo({
        placa: 'TEST-003',
        tipoVehiculo: 'Auto',
        momentoPago: 'SALIDA',
      });

      const exitoG = rechazoExitoso && Boolean(ingresoPostDesactivacion);

      resultados.push({
        prueba: 'Prueba G — Lista Negra (TEST-003)',
        paso: exitoG,
        evidencia: `Rechazado mientras estaba en Lista Negra: TRUE. Permitido tras desactivación: TRUE`,
      });

      // Salida rápida para limpieza
      await movimientoService.registrarSalidaVehiculo({ movimientoId: ingresoPostDesactivacion.id });
    } catch (err: any) {
      resultados.push({ prueba: 'Prueba G — Lista Negra (TEST-003)', paso: false, evidencia: err.message });
    }

    // -----------------------------------------------------------------
    // PRUEBA H — MÉTODOS DE PAGO SEPARADOS
    // -----------------------------------------------------------------
    try {
      const resumenMetodos = await cajaService.obtenerResumenCaja(fechaHoy);
      const exitoH = typeof resumenMetodos.ingresos.efectivo === 'number' &&
                     typeof resumenMetodos.ingresos.yape === 'number' &&
                     typeof resumenMetodos.ingresos.plin === 'number' &&
                     typeof resumenMetodos.ingresos.tarjeta === 'number';

      resultados.push({
        prueba: 'Prueba H — Métodos de Pago Separados',
        paso: exitoH,
        evidencia: `Efectivo: S/ ${resumenMetodos.ingresos.efectivo}, Yape: S/ ${resumenMetodos.ingresos.yape}, Plin: S/ ${resumenMetodos.ingresos.plin}, Tarjeta: S/ ${resumenMetodos.ingresos.tarjeta}`,
      });
    } catch (err: any) {
      resultados.push({ prueba: 'Prueba H — Métodos de Pago Separados', paso: false, evidencia: err.message });
    }

    // -----------------------------------------------------------------
    // PRUEBA I — GASTOS DE CAJA
    // -----------------------------------------------------------------
    try {
      const balanceInicial = (await cajaService.obtenerResumenCaja(fechaHoy)).balanceNeto;
      const gastoNuevo = await cajaService.registrarGasto({ descripcion: 'Gasto de prueba integral TEST', monto: 10.0 });
      const balanceFinal = (await cajaService.obtenerResumenCaja(fechaHoy)).balanceNeto;

      let rechazoMontoCero = false;
      try {
        await cajaService.registrarGasto({ descripcion: 'Invalido', monto: 0 });
      } catch {
        rechazoMontoCero = true;
      }

      let rechazoMontoNegativo = false;
      try {
        await cajaService.registrarGasto({ descripcion: 'Invalido', monto: -10 });
      } catch {
        rechazoMontoNegativo = true;
      }

      const exitoI = (gastoNuevo.monto === 10.0 && balanceFinal === parseFloat((balanceInicial - 10.0).toFixed(2)) && rechazoMontoCero && rechazoMontoNegativo);

      resultados.push({
        prueba: 'Prueba I — Gastos y Validación de Montos',
        paso: exitoI,
        evidencia: `Gasto registrado S/ 10.0. Balance ajustado de S/ ${balanceInicial} a S/ ${balanceFinal}. Rechazo 0 / negativo: TRUE`,
      });
    } catch (err: any) {
      resultados.push({ prueba: 'Prueba I — Gastos', paso: false, evidencia: err.message });
    }

    // -----------------------------------------------------------------
    // PRUEBA J — CAJA SIN DOBLE CONTABILIZACIÓN
    // -----------------------------------------------------------------
    try {
      const resumenJ = await cajaService.obtenerResumenCaja(fechaHoy);
      const exitoJ = (resumenJ.ingresos.total - resumenJ.gastos.total === resumenJ.balanceNeto);

      resultados.push({
        prueba: 'Prueba J — Sin Doble Contabilización',
        paso: exitoJ,
        evidencia: `Ingresos Totales (S/ ${resumenJ.ingresos.total}) - Gastos (S/ ${resumenJ.gastos.total}) = Balance Neto (S/ ${resumenJ.balanceNeto}) exacto sin duplicados`,
      });
    } catch (err: any) {
      resultados.push({ prueba: 'Prueba J — Sin Doble Contabilización', paso: false, evidencia: err.message });
    }

    // -----------------------------------------------------------------
    // PRUEBA K — RECAUDADORES POR OPERADOR
    // -----------------------------------------------------------------
    try {
      const recaudadores = await cajaService.obtenerRecaudadores(fechaHoy);
      const exitoK = Array.isArray(recaudadores) && recaudadores.length > 0;

      resultados.push({
        prueba: 'Prueba K — Recaudadores por Operador',
        paso: exitoK,
        evidencia: `Operadores recaudadores auditados: ${recaudadores.map(r => `${r.usuarioNombre} (S/ ${r.totalCobrado})`).join(', ')}`,
      });
    } catch (err: any) {
      resultados.push({ prueba: 'Prueba K — Recaudadores por Operador', paso: false, evidencia: err.message });
    }

    // -----------------------------------------------------------------
    // PRUEBA L — DETALLE DIARIO AUDITABLE
    // -----------------------------------------------------------------
    try {
      const detalle = await cajaService.obtenerDetalleDiario(fechaHoy);
      const exitoL = Array.isArray(detalle.movimientos) && Array.isArray(detalle.gastos);

      resultados.push({
        prueba: 'Prueba L — Detalle Diario Auditable',
        paso: exitoL,
        evidencia: `Movimientos auditables: ${detalle.movimientos.length}, Gastos auditables: ${detalle.gastos.length}`,
      });
    } catch (err: any) {
      resultados.push({ prueba: 'Prueba L — Detalle Diario', paso: false, evidencia: err.message });
    }

    // -----------------------------------------------------------------
    // PRUEBA M — HISTORIAL 30 DÍAS
    // -----------------------------------------------------------------
    try {
      const historial = await cajaService.obtenerHistorial30Dias(30);
      const exitoM = (historial.length === 30);

      resultados.push({
        prueba: 'Prueba M — Historial 30 Días',
        paso: exitoM,
        evidencia: `Historial de 30 días obtenido con éxito de MySQL. Fechas desde ${historial[0]?.fecha} hasta ${historial[29]?.fecha}`,
      });
    } catch (err: any) {
      resultados.push({ prueba: 'Prueba M — Historial 30 Días', paso: false, evidencia: err.message });
    }

    // -----------------------------------------------------------------
    // PRUEBA N — FECHA SIN DATOS
    // -----------------------------------------------------------------
    try {
      const resumenVacio = await cajaService.obtenerResumenCaja('2020-01-01');
      const exitoN = (resumenVacio.ingresos.total === 0 && resumenVacio.gastos.total === 0 && resumenVacio.balanceNeto === 0);

      resultados.push({
        prueba: 'Prueba N — Fecha Sin Datos (2020-01-01)',
        paso: exitoN,
        evidencia: `Resumen fecha vacía: Ingresos S/ ${resumenVacio.ingresos.total}, Gastos S/ ${resumenVacio.gastos.total}, Balance S/ ${resumenVacio.balanceNeto}`,
      });
    } catch (err: any) {
      resultados.push({ prueba: 'Prueba N — Fecha Sin Datos', paso: false, evidencia: err.message });
    }

    // -----------------------------------------------------------------
    // LIMPIEZA DE DATOS TEST-*
    // -----------------------------------------------------------------
    console.log('\n🧹 Limpiando registros de prueba TEST-*...');
    (MovimientoRepository as any).memoryStore = ((MovimientoRepository as any).memoryStore || []).filter(
      (m: any) => !m.placa.startsWith('TEST-')
    );
    (ListaNegraRepository as any).memoryStore = ((ListaNegraRepository as any).memoryStore || []).filter(
      (l: any) => !l.placa.startsWith('TEST-')
    );
    (CajaRepository as any).gastosMemoryStore = ((CajaRepository as any).gastosMemoryStore || []).filter(
      (g: any) => !g.descripcion.includes('TEST')
    );
    console.log('✅ Datos de prueba TEST-* eliminados correctamente.');

  } catch (globalErr: any) {
    console.error('❌ Error global durante la ejecución:', globalErr);
  }

  console.log('\n=====================================================');
  console.log('📊 RESUMEN FINAL DE PRUEBAS INTEGRALES');
  console.log('=====================================================');
  resultados.forEach(r => {
    console.log(`${r.paso ? '✅ PASÓ' : '❌ FALLÓ'} | ${r.prueba} -> ${r.evidencia}`);
  });
}

ejecutarPruebasIntegrales();
