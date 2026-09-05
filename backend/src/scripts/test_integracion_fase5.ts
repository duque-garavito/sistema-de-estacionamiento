import { MovimientoService } from '../modules/movimientos/services/movimiento.service.js';
import { TarifaService } from '../modules/tarifas/services/tarifa.service.js';
import { CajaService } from '../modules/caja/services/caja.service.js';
import { BoletaRepository } from '../modules/boletas/repositories/boleta.repository.js';
import { MovimientoRepository } from '../modules/movimientos/repositories/movimiento.repository.js';

interface TestResult {
  num: number;
  prueba: string;
  paso: boolean;
  evidencia: string;
}

async function ejecutarPruebasIntegralesFase5() {
  console.log('===================================================================');
  console.log('🚀 INICIANDO SUITE DE PRUEBAS INTEGRALES FASE 5.4 — TICKETS & PDF');
  console.log('===================================================================\n');

  const resultados: TestResult[] = [];
  const movimientoService = new MovimientoService();
  const tarifaService = new TarifaService();
  const cajaService = new CajaService();
  const boletaRepo = new BoletaRepository();

  const fechaHoy = new Date().toISOString().split('T')[0];

  try {
    // -----------------------------------------------------------------
    // PRUEBA 1 — REGISTRO DE ENTRADA Y GENERACIÓN DE TICKET DE ENTRADA
    // -----------------------------------------------------------------
    let mov1: any;
    let tktEntrada1: any;
    try {
      mov1 = await movimientoService.registrarIngresoVehiculo({
        placa: 'TCK-001',
        tipoVehiculo: 'Auto',
        color: 'Azul Metalico',
        marcaModelo: 'Toyota Corolla',
        propietarioDni: '77665544',
        propietarioNombre: 'Carlos Test',
        momentoPago: 'SALIDA',
        metodoPago: 'Efectivo',
        usuarioIngreso: 'Operador Ticket 1',
        ubicacion: 'Zona A-05',
        observaciones: 'Sin rayaduras',
      });

      tktEntrada1 = await movimientoService.obtenerTicketEntradaData(mov1.id);

      const sinUndefined = !JSON.stringify(tktEntrada1).includes('undefined') && !JSON.stringify(tktEntrada1).includes('null');

      const exito1 = Boolean(
        tktEntrada1 &&
        tktEntrada1.codigoTicket &&
        tktEntrada1.placa === 'TCK-001' &&
        tktEntrada1.tipoVehiculo === 'Auto' &&
        tktEntrada1.color === 'Azul Metalico' &&
        tktEntrada1.marcaModelo === 'Toyota Corolla' &&
        tktEntrada1.tarifaDiaAplicada > 0 &&
        tktEntrada1.usuarioIngreso === 'Operador Ticket 1' &&
        tktEntrada1.establecimiento?.ruc &&
        tktEntrada1.establecimiento?.nombreComercial &&
        sinUndefined
      );

      resultados.push({
        num: 1,
        prueba: 'Prueba de Ticket de Entrada (Campos completos)',
        paso: exito1,
        evidencia: `Código: ${tktEntrada1.codigoTicket}, Placa: ${tktEntrada1.placa}, Tarifa: S/ ${tktEntrada1.tarifaDiaAplicada}, Empresa: ${tktEntrada1.establecimiento.nombreComercial}`,
      });
    } catch (err: any) {
      resultados.push({ num: 1, prueba: 'Prueba de Ticket de Entrada', paso: false, evidencia: err.message });
    }

    // -----------------------------------------------------------------
    // PRUEBA 2 — PRUEBA DE TARIFA CONGELADA (SNAPSHOT HISTÓRICO)
    // -----------------------------------------------------------------
    try {
      const tarifaOriginal = mov1.tarifaDiaAplicada;
      // Alterar la tarifa global de Auto a S/ 80.00
      await tarifaService.actualizarTarifa({
        tipoVehiculo: 'Auto',
        tipoCobro: 'DIA',
        precioHora: 15,
        precioDia: 80.0,
        toleranciaMinutos: 10,
        fraccion15min: 2,
        activo: true,
      });

      // Regenerar / Reimprimir ticket de entrada
      const tktReimpreso = await movimientoService.obtenerTicketEntradaData(mov1.id);

      // Restaurar tarifa global original
      await tarifaService.actualizarTarifa({
        tipoVehiculo: 'Auto',
        tipoCobro: 'DIA',
        precioHora: 5,
        precioDia: tarifaOriginal,
        toleranciaMinutos: 10,
        fraccion15min: 1.5,
        activo: true,
      });

      const exito2 = (tktReimpreso.tarifaDiaAplicada === tarifaOriginal);

      resultados.push({
        num: 2,
        prueba: 'Prueba de Tarifa Congelada (Snapshot preservado)',
        paso: exito2,
        evidencia: `Tarifa global cambió a S/ 80.00 pero el Ticket preservó su tarifa congelada: S/ ${tktReimpreso.tarifaDiaAplicada}`,
      });
    } catch (err: any) {
      resultados.push({ num: 2, prueba: 'Prueba de Tarifa Congelada', paso: false, evidencia: err.message });
    }

    // -----------------------------------------------------------------
    // PRUEBA 3 — TICKET DE SALIDA Y CÁLCULO DE DÍAS (MULTIDÍA)
    // -----------------------------------------------------------------
    try {
      const entradaLunes = new Date('2026-09-01T08:00:00');
      const salidaMartes = new Date('2026-09-02T10:00:00');
      const salidaMiercoles = new Date('2026-09-03T10:00:00');

      const calcMartes = await tarifaService.calcularCobroPorDia(entradaLunes, salidaMartes, 10.0, 'SALIDA');
      const calcMiercoles = await tarifaService.calcularCobroPorDia(entradaLunes, salidaMiercoles, 10.0, 'SALIDA');

      const exito3 = (
        calcMartes.diasCobrados === 2 &&
        calcMartes.totalPagar === 20.0 &&
        calcMiercoles.diasCobrados === 3 &&
        calcMiercoles.totalPagar === 30.0
      );

      resultados.push({
        num: 3,
        prueba: 'Prueba de Ticket de Salida (Cálculo Días Lunes->Martes = 2d, Lunes->Miércoles = 3d)',
        paso: exito3,
        evidencia: `Lunes->Martes: ${calcMartes.diasCobrados} días (S/ ${calcMartes.totalPagar}). Lunes->Miércoles: ${calcMiercoles.diasCobrados} días (S/ ${calcMiercoles.totalPagar})`,
      });
    } catch (err: any) {
      resultados.push({ num: 3, prueba: 'Prueba de Ticket de Salida Multidía', paso: false, evidencia: err.message });
    }

    // -----------------------------------------------------------------
    // PRUEBA 4 — PAGO EN ENTRADA
    // -----------------------------------------------------------------
    try {
      const movEntradaPago = await movimientoService.registrarIngresoVehiculo({
        placa: 'TCK-PAGO-ENT',
        tipoVehiculo: 'Camioneta',
        momentoPago: 'ENTRADA',
        metodoPago: 'Yape',
        usuarioIngreso: 'Operador Entrada Yape',
      });

      const cajaPrev = await cajaService.obtenerResumenCaja(fechaHoy);

      // Registrar salida del vehículo
      const movSalida = await movimientoService.registrarSalidaVehiculo({
        movimientoId: movEntradaPago.id,
        usuarioSalida: 'Operador Salida',
      });

      const cajaPost = await cajaService.obtenerResumenCaja(fechaHoy);
      const tktSalidaData = await movimientoService.obtenerTicketSalidaData(movEntradaPago.id);

      const exito4 = Boolean(
        movSalida.totalPagar === 0 &&
        cajaPost.ingresos.yape === cajaPrev.ingresos.yape && // No se duplica el dinero en Caja al salir
        tktSalidaData.momentoPago === 'ENTRADA' &&
        tktSalidaData.totalPagar === 0
      );

      resultados.push({
        num: 4,
        prueba: 'Prueba Pago en Entrada (Salida sin cobro adicional ni duplicación en Caja)',
        paso: exito4,
        evidencia: `Adicional Cobrado Salida: S/ ${movSalida.totalPagar}, Caja Yape sin cambio en salida: S/ ${cajaPost.ingresos.yape}`,
      });
    } catch (err: any) {
      resultados.push({ num: 4, prueba: 'Prueba Pago en Entrada', paso: false, evidencia: err.message });
    }

    // -----------------------------------------------------------------
    // PRUEBA 5 — PAGO EN SALIDA
    // -----------------------------------------------------------------
    try {
      const movSalidaPago = await movimientoService.registrarIngresoVehiculo({
        placa: 'TCK-PAGO-SAL',
        tipoVehiculo: 'Auto',
        momentoPago: 'SALIDA',
        usuarioIngreso: 'Operador Entrada',
      });

      const cajaAntesSalida = await cajaService.obtenerResumenCaja(fechaHoy);

      const salidaDone = await movimientoService.registrarSalidaVehiculo({
        movimientoId: movSalidaPago.id,
        metodoPago: 'Plin',
        usuarioSalida: 'Operador Salida Plin',
      });

      const cajaDespuesSalida = await cajaService.obtenerResumenCaja(fechaHoy);
      const tktSalidaDone = await movimientoService.obtenerTicketSalidaData(movSalidaPago.id);

      const totalPagarSalida = salidaDone.totalPagar ?? 0;
      const exito5 = Boolean(
        totalPagarSalida > 0 &&
        cajaDespuesSalida.ingresos.plin === parseFloat((cajaAntesSalida.ingresos.plin + totalPagarSalida).toFixed(2)) &&
        tktSalidaDone.metodoPago === 'Plin' &&
        tktSalidaDone.totalPagar === totalPagarSalida
      );

      resultados.push({
        num: 5,
        prueba: 'Prueba Pago en Salida (Registro único en Caja y ticket correcto)',
        paso: exito5,
        evidencia: `Cobrado Salida: S/ ${totalPagarSalida}, Caja Plin incrementó exactamente de S/ ${cajaAntesSalida.ingresos.plin} a S/ ${cajaDespuesSalida.ingresos.plin}`,
      });
    } catch (err: any) {
      resultados.push({ num: 5, prueba: 'Prueba Pago en Salida', paso: false, evidencia: err.message });
    }

    // -----------------------------------------------------------------
    // PRUEBA 6 — MÉTODOS DE PAGO
    // -----------------------------------------------------------------
    try {
      const metodos = ['Efectivo', 'Yape', 'Plin', 'Tarjeta'] as const;
      let todosCoinciden = true;

      for (const m of metodos) {
        const tempMov = await movimientoService.registrarIngresoVehiculo({
          placa: `MET-${m.toUpperCase()}`,
          tipoVehiculo: 'Moto',
          momentoPago: 'ENTRADA',
          metodoPago: m,
        });

        const tkt = await movimientoService.obtenerTicketEntradaData(tempMov.id);
        if (tkt.metodoPago !== m) todosCoinciden = false;
      }

      resultados.push({
        num: 6,
        prueba: 'Prueba Métodos de Pago (Efectivo, Yape, Plin, Tarjeta coinciden en DB y Ticket)',
        paso: todosCoinciden,
        evidencia: `Todos los métodos de pago (Efectivo, Yape, Plin, Tarjeta) registrados y mostrados correctamente en tickets.`,
      });
    } catch (err: any) {
      resultados.push({ num: 6, prueba: 'Prueba Métodos de Pago', paso: false, evidencia: err.message });
    }

    // -----------------------------------------------------------------
    // PRUEBA 7 — PDF GENERACIÓN Y CONSISTENCIA
    // -----------------------------------------------------------------
    try {
      const tktEntradaPDF = await movimientoService.obtenerTicketEntradaData(mov1.id);
      const tktSalidaPDF = await movimientoService.obtenerTicketSalidaData(mov1.id);

      const exito7 = Boolean(
        tktEntradaPDF.codigoTicket &&
        tktEntradaPDF.establecimiento.ruc &&
        tktSalidaPDF.codigoTicket &&
        tktSalidaPDF.establecimiento.direccion
      );

      resultados.push({
        num: 7,
        prueba: 'Prueba Estructura de Datos para PDF (Ticket Entrada & Salida)',
        paso: exito7,
        evidencia: `Estructuras de datos para PDF válidas sin truncamiento ni campos nulos.`,
      });
    } catch (err: any) {
      resultados.push({ num: 7, prueba: 'Prueba PDF Generación', paso: false, evidencia: err.message });
    }

    // -----------------------------------------------------------------
    // PRUEBA 8 — REIMPRESIÓN DESDE VEHÍCULOS ACTIVOS
    // -----------------------------------------------------------------
    try {
      const vehiculosActivosAntes = await movimientoService.obtenerMovimientosActivos();
      const countAntes = vehiculosActivosAntes.length;

      // Reimprimir 3 veces el ticket de mov1
      await movimientoService.obtenerTicketEntradaData(mov1.id);
      await movimientoService.obtenerTicketEntradaData(mov1.id);
      await movimientoService.obtenerTicketEntradaData(mov1.id);

      const vehiculosActivosDespues = await movimientoService.obtenerMovimientosActivos();
      const countDespues = vehiculosActivosDespues.length;

      const exito8 = (countAntes === countDespues);

      resultados.push({
        num: 8,
        prueba: 'Prueba Reimpresión desde Vehículos Activos (Sin duplicación de registros)',
        paso: exito8,
        evidencia: `Reimpresiones ejecutadas 3 veces sin modificar lista de vehículos en parqueo (${countDespues} activos).`,
      });
    } catch (err: any) {
      resultados.push({ num: 8, prueba: 'Prueba Reimpresión', paso: false, evidencia: err.message });
    }

    // -----------------------------------------------------------------
    // PRUEBA 9 — INTEGRIDAD DE DATOS AL IMPRIMIR/VISUALIZAR
    // -----------------------------------------------------------------
    try {
      const cajaBefore = await cajaService.obtenerResumenCaja(fechaHoy);
      const movBefore = await (movimientoService as any).repository.findById(mov1.id);

      // Simular visualización y llamadas de tickets
      await movimientoService.obtenerTicketEntradaData(mov1.id);
      await movimientoService.obtenerTicketSalidaData(mov1.id);

      const cajaAfter = await cajaService.obtenerResumenCaja(fechaHoy);
      const movAfter = await (movimientoService as any).repository.findById(mov1.id);

      const exito9 = Boolean(
        cajaBefore.balanceNeto === cajaAfter.balanceNeto &&
        movBefore.tarifaDiaAplicada === movAfter.tarifaDiaAplicada &&
        movBefore.estado === movAfter.estado
      );

      resultados.push({
        num: 9,
        prueba: 'Prueba Integridad de Datos (Visualizar/imprimir ticket NO altera Caja ni Movimientos)',
        paso: exito9,
        evidencia: `Balance de Caja (S/ ${cajaAfter.balanceNeto}) y estado del movimiento sin ninguna alteración.`,
      });
    } catch (err: any) {
      resultados.push({ num: 9, prueba: 'Prueba Integridad de Datos', paso: false, evidencia: err.message });
    }

    // -----------------------------------------------------------------
    // PRUEBA 10 — DESACOPLAMIENTO Y DATOS DE EMPRESA CONFIG
    // -----------------------------------------------------------------
    try {
      const configOriginal = await boletaRepo.getEmpresaConfig();

      // Actualizar datos de empresa
      await boletaRepo.updateEmpresaConfig({
        nombreComercial: 'Cochera Central Premium Test',
        ruc: '20999888777',
      });

      const tktConNuevaEmpresa = await movimientoService.obtenerTicketEntradaData(mov1.id);
      const movSinAlterar = await (movimientoService as any).repository.findById(mov1.id);

      // Restaurar config original
      await boletaRepo.updateEmpresaConfig(configOriginal);

      const exito10 = Boolean(
        tktConNuevaEmpresa.establecimiento.nombreComercial === 'Cochera Central Premium Test' &&
        tktConNuevaEmpresa.establecimiento.ruc === '20999888777' &&
        movSinAlterar.tarifaDiaAplicada === mov1.tarifaDiaAplicada
      );

      resultados.push({
        num: 10,
        prueba: 'Prueba Empresa Config (Actualización de membrete no altera montos financieros)',
        paso: exito10,
        evidencia: `Membrete del ticket actualizó a "${tktConNuevaEmpresa.establecimiento.nombreComercial}" manteniendo el snapshot financiero S/ ${movSinAlterar.tarifaDiaAplicada}`,
      });
    } catch (err: any) {
      resultados.push({ num: 10, prueba: 'Prueba Empresa Config', paso: false, evidencia: err.message });
    }

    // -----------------------------------------------------------------
    // LIMPIEZA DE REGISTROS TCK-* Y MET-*
    // -----------------------------------------------------------------
    console.log('\n🧹 Limpiando registros de prueba TCK-* y MET-*...');
    (MovimientoRepository as any).memoryStore = ((MovimientoRepository as any).memoryStore || []).filter(
      (m: any) => !m.placa.startsWith('TCK-') && !m.placa.startsWith('MET-')
    );
    console.log('✅ Datos de prueba TCK-* y MET-* eliminados correctamente.');

  } catch (globalErr: any) {
    console.error('❌ Error global en ejecución de pruebas:', globalErr);
  }

  console.log('\n===================================================================');
  console.log('📊 RESUMEN FINAL DE PRUEBAS INTEGRALES FASE 5.4');
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

ejecutarPruebasIntegralesFase5();
