import { dbPool } from '../../../core/config/database.js';
import { MovimientoRepository } from '../../movimientos/repositories/movimiento.repository.js';
import { CajaRepository } from '../../caja/repositories/caja.repository.js';
import {
  ReporteIngresosResponse,
  ReporteVehiculosResponse,
  ReporteOperadoresResponse,
  ReporteCajaBalanceResponse,
  RegistroAuditoria,
} from '../types/reportes.types.js';

export class ReportesRepository {
  private cajaRepo = new CajaRepository();

  private resolverRangoFechas(rango?: string, fechaInicio?: string, fechaFin?: string): { inicio: Date; fin: Date } {
    const ahora = new Date();
    let inicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 0, 0, 0);
    let fin = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 59);

    if (rango === 'ayer') {
      const ayer = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
      inicio = new Date(ayer.getFullYear(), ayer.getMonth(), ayer.getDate(), 0, 0, 0);
      fin = new Date(ayer.getFullYear(), ayer.getMonth(), ayer.getDate(), 23, 59, 59);
    } else if (rango === 'semana') {
      const diaSemana = ahora.getDay() || 7; // 1 = Lunes
      inicio = new Date(ahora.getTime() - (diaSemana - 1) * 24 * 60 * 60 * 1000);
      inicio.setHours(0, 0, 0, 0);
    } else if (rango === 'mes') {
      inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1, 0, 0, 0);
    } else if (rango === 'personalizado' && fechaInicio) {
      inicio = new Date(`${fechaInicio}T00:00:00`);
      fin = fechaFin ? new Date(`${fechaFin}T23:59:59`) : fin;
    }

    return { inicio, fin };
  }

  async obtenerReporteIngresos(rango?: string, fechaInicio?: string, fechaFin?: string): Promise<ReporteIngresosResponse> {
    const { inicio, fin } = this.resolverRangoFechas(rango, fechaInicio, fechaFin);
    const inicioStr = inicio.toISOString();
    const finStr = fin.toISOString();

    let totalRecaudado = 0;
    let totalOperaciones = 0;
    let efectivo = 0;
    let yape = 0;
    let plin = 0;
    let tarjeta = 0;
    const mapaDias = new Map<string, { monto: number; cantidad: number }>();

    try {
      const sql = `
        SELECT fecha_pago, metodo_pago, total_cobrado FROM (
          SELECT DATE(fecha_entrada) as fecha_pago, metodo_pago, tarifa_dia_aplicada as total_cobrado
          FROM movimientos
          WHERE momento_pago = 'ENTRADA' AND fecha_entrada BETWEEN ? AND ?

          UNION ALL

          SELECT DATE(fecha_salida) as fecha_pago, metodo_pago, total_pagar as total_cobrado
          FROM movimientos
          WHERE momento_pago = 'SALIDA' AND fecha_salida IS NOT NULL AND fecha_salida BETWEEN ? AND ? AND estado = 'Completado'
        ) as unidos
      `;
      const [rows]: any = await dbPool.query(sql, [inicioStr, finStr, inicioStr, finStr]);
      if (Array.isArray(rows) && rows.length > 0) {
        rows.forEach((r: any) => {
          const monto = Number(r.total_cobrado || 0);
          const fKey = r.fecha_pago ? new Date(r.fecha_pago).toISOString().split('T')[0] : 'Fecha Desconocida';
          const metodo = (r.metodo_pago || 'Efectivo').toLowerCase();

          totalRecaudado += monto;
          totalOperaciones++;

          if (metodo.includes('efectivo')) efectivo += monto;
          else if (metodo.includes('yape')) yape += monto;
          else if (metodo.includes('plin')) plin += monto;
          else if (metodo.includes('tarjeta')) tarjeta += monto;
          else efectivo += monto;

          const dVal = mapaDias.get(fKey) || { monto: 0, cantidad: 0 };
          mapaDias.set(fKey, { monto: dVal.monto + monto, cantidad: dVal.cantidad + 1 });
        });
      }
    } catch {
      // MemoryStore fallback
      const movs = (MovimientoRepository as any).memoryStore || [];
      movs.forEach((m: any) => {
        let fechaCobro: Date | null = null;
        let monto = 0;

        if (m.momentoPago === 'ENTRADA') {
          fechaCobro = new Date(m.fechaEntrada);
          monto = m.tarifaDiaAplicada || 10.0;
        } else if (m.momentoPago === 'SALIDA' && m.estado === 'Completado' && m.fechaSalida) {
          fechaCobro = new Date(m.fechaSalida);
          monto = m.totalPagar || 0;
        }

        if (fechaCobro && fechaCobro >= inicio && fechaCobro <= fin) {
          const fKey = fechaCobro.toISOString().split('T')[0];
          const metodo = (m.metodoPago || 'Efectivo').toLowerCase();

          totalRecaudado += monto;
          totalOperaciones++;

          if (metodo.includes('efectivo')) efectivo += monto;
          else if (metodo.includes('yape')) yape += monto;
          else if (metodo.includes('plin')) plin += monto;
          else if (metodo.includes('tarjeta')) tarjeta += monto;
          else efectivo += monto;

          const dVal = mapaDias.get(fKey) || { monto: 0, cantidad: 0 };
          mapaDias.set(fKey, { monto: dVal.monto + monto, cantidad: dVal.cantidad + 1 });
        }
      });
    }

    const ingresosPorDia = Array.from(mapaDias.entries())
      .map(([fecha, v]) => ({ fecha, monto: parseFloat(v.monto.toFixed(2)), cantidad: v.cantidad }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    return {
      totalRecaudado: parseFloat(totalRecaudado.toFixed(2)),
      totalOperaciones,
      metodosPago: {
        efectivo: parseFloat(efectivo.toFixed(2)),
        yape: parseFloat(yape.toFixed(2)),
        plin: parseFloat(plin.toFixed(2)),
        tarjeta: parseFloat(tarjeta.toFixed(2)),
      },
      promedioTicket: totalOperaciones > 0 ? parseFloat((totalRecaudado / totalOperaciones).toFixed(2)) : 0,
      ingresosPorDia,
    };
  }

  async obtenerReporteVehiculos(rango?: string, fechaInicio?: string, fechaFin?: string): Promise<ReporteVehiculosResponse> {
    const { inicio, fin } = this.resolverRangoFechas(rango, fechaInicio, fechaFin);
    const movs = (MovimientoRepository as any).memoryStore || [];

    let entradasRegistradas = 0;
    let salidasRegistradas = 0;
    let actualmenteParqueados = 0;
    const mapaPlacas = new Map<string, { visitas: number; totalGasto: number; tipoVehiculo: string }>();

    movs.forEach((m: any) => {
      const fEntrada = new Date(m.fechaEntrada);
      const fSalida = m.fechaSalida ? new Date(m.fechaSalida) : null;

      if (fEntrada >= inicio && fEntrada <= fin) {
        entradasRegistradas++;
      }

      if (fSalida && fSalida >= inicio && fSalida <= fin) {
        salidasRegistradas++;
      }

      if (m.estado === 'Activo') {
        actualmenteParqueados++;
      }

      const prev = mapaPlacas.get(m.placa) || { visitas: 0, totalGasto: 0, tipoVehiculo: m.tipoVehiculo };
      const montoCobrado = m.momentoPago === 'ENTRADA' ? (m.tarifaDiaAplicada || 10) : (m.totalPagar || 0);
      mapaPlacas.set(m.placa, {
        visitas: prev.visitas + 1,
        totalGasto: prev.totalGasto + montoCobrado,
        tipoVehiculo: m.tipoVehiculo,
      });
    });

    const placasFrecuentes = Array.from(mapaPlacas.entries())
      .map(([placa, v]) => ({
        placa,
        visitas: v.visitas,
        totalGasto: parseFloat(v.totalGasto.toFixed(2)),
        tipoVehiculo: v.tipoVehiculo,
      }))
      .sort((a, b) => b.visitas - a.visitas)
      .slice(0, 10);

    return {
      totalAtendidos: entradasRegistradas + salidasRegistradas,
      entradasRegistradas,
      salidasRegistradas,
      actualmenteParqueados,
      placasFrecuentes,
    };
  }

  async obtenerReporteOperadores(rango?: string, fechaInicio?: string, fechaFin?: string): Promise<ReporteOperadoresResponse[]> {
    const { inicio, fin } = this.resolverRangoFechas(rango, fechaInicio, fechaFin);
    const movs = (MovimientoRepository as any).memoryStore || [];
    const mapaOp = new Map<string, { entradas: number; salidas: number; cobros: number; total: number; efectivo: number; yape: number; plin: number; tarjeta: number }>();

    const getOrCreate = (op: string) => {
      if (!mapaOp.has(op)) {
        mapaOp.set(op, { entradas: 0, salidas: 0, cobros: 0, total: 0, efectivo: 0, yape: 0, plin: 0, tarjeta: 0 });
      }
      return mapaOp.get(op)!;
    };

    movs.forEach((m: any) => {
      const fEntrada = new Date(m.fechaEntrada);
      const fSalida = m.fechaSalida ? new Date(m.fechaSalida) : null;
      const opIngreso = m.usuarioIngreso || 'Operador Entrada';
      const opSalida = m.usuarioSalida || 'Operador Salida';

      if (fEntrada >= inicio && fEntrada <= fin) {
        const itemIngreso = getOrCreate(opIngreso);
        itemIngreso.entradas++;

        if (m.momentoPago === 'ENTRADA') {
          itemIngreso.cobros++;
          const monto = m.tarifaDiaAplicada || 10;
          itemIngreso.total += monto;
          const metodo = (m.metodoPago || 'Efectivo').toLowerCase();
          if (metodo.includes('efectivo')) itemIngreso.efectivo += monto;
          else if (metodo.includes('yape')) itemIngreso.yape += monto;
          else if (metodo.includes('plin')) itemIngreso.plin += monto;
          else if (metodo.includes('tarjeta')) itemIngreso.tarjeta += monto;
          else itemIngreso.efectivo += monto;
        }
      }

      if (fSalida && fSalida >= inicio && fSalida <= fin) {
        const itemSalida = getOrCreate(opSalida);
        itemSalida.salidas++;

        if (m.momentoPago === 'SALIDA' && m.estado === 'Completado') {
          itemSalida.cobros++;
          const monto = m.totalPagar || 0;
          itemSalida.total += monto;
          const metodo = (m.metodoPago || 'Efectivo').toLowerCase();
          if (metodo.includes('efectivo')) itemSalida.efectivo += monto;
          else if (metodo.includes('yape')) itemSalida.yape += monto;
          else if (metodo.includes('plin')) itemSalida.plin += monto;
          else if (metodo.includes('tarjeta')) itemSalida.tarjeta += monto;
          else itemSalida.efectivo += monto;
        }
      }
    });

    return Array.from(mapaOp.entries()).map(([op, v]) => ({
      operador: op,
      entradasRegistradas: v.entradas,
      salidasRegistradas: v.salidas,
      cobrosRealizados: v.cobros,
      totalRecaudado: parseFloat(v.total.toFixed(2)),
      metodosPago: {
        efectivo: parseFloat(v.efectivo.toFixed(2)),
        yape: parseFloat(v.yape.toFixed(2)),
        plin: parseFloat(v.plin.toFixed(2)),
        tarjeta: parseFloat(v.tarjeta.toFixed(2)),
      },
    }));
  }

  async obtenerReporteCajaBalance(rango?: string, fechaInicio?: string, fechaFin?: string): Promise<ReporteCajaBalanceResponse> {
    const { inicio, fin } = this.resolverRangoFechas(rango, fechaInicio, fechaFin);

    const ingresosInfo = await this.obtenerReporteIngresos(rango, fechaInicio, fechaFin);
    const todosGastos = await this.cajaRepo.obtenerGastosPorFecha(new Date().toISOString().split('T')[0]);

    const gastosFiltrados = todosGastos.filter((g) => {
      const fGasto = new Date(g.fechaHora);
      return fGasto >= inicio && fGasto <= fin;
    });

    const gastosTotales = gastosFiltrados.reduce((acc, g) => acc + g.monto, 0);

    return {
      ingresosTotales: ingresosInfo.totalRecaudado,
      desgloseIngresos: ingresosInfo.metodosPago,
      gastosTotales: parseFloat(gastosTotales.toFixed(2)),
      balanceNeto: parseFloat((ingresosInfo.totalRecaudado - gastosTotales).toFixed(2)),
      gastosDetalle: gastosFiltrados.map((g) => ({
        id: g.id,
        descripcion: g.descripcion,
        monto: g.monto,
        usuarioNombre: g.usuarioNombre,
        fechaHora: g.fechaHora.toISOString(),
      })),
    };
  }

  async obtenerAuditoria(rango?: string, fechaInicio?: string, fechaFin?: string): Promise<RegistroAuditoria[]> {
    const { inicio, fin } = this.resolverRangoFechas(rango, fechaInicio, fechaFin);
    const movs = (MovimientoRepository as any).memoryStore || [];
    const registros: RegistroAuditoria[] = [];

    movs.forEach((m: any) => {
      const fEntrada = new Date(m.fechaEntrada);
      const fSalida = m.fechaSalida ? new Date(m.fechaSalida) : null;

      if (fEntrada >= inicio && fEntrada <= fin) {
        registros.push({
          id: `ENT-${m.id}`,
          codigoTicket: m.codigoTicket || 'TKT-000',
          placa: m.placa,
          tipoVehiculo: m.tipoVehiculo,
          accion: 'REGISTRO_ENTRADA',
          usuario: m.usuarioIngreso || 'Operador Entrada',
          monto: m.momentoPago === 'ENTRADA' ? (m.tarifaDiaAplicada || 10) : 0,
          metodoPago: m.momentoPago === 'ENTRADA' ? (m.metodoPago || 'Efectivo') : 'Pendiente',
          fechaHora: m.fechaEntrada,
        });
      }

      if (fSalida && fSalida >= inicio && fSalida <= fin) {
        registros.push({
          id: `SAL-${m.id}`,
          codigoTicket: m.codigoTicket || 'TKT-000',
          placa: m.placa,
          tipoVehiculo: m.tipoVehiculo,
          accion: 'REGISTRO_SALIDA_COBRO',
          usuario: m.usuarioSalida || 'Operador Salida',
          monto: m.totalPagar || 0,
          metodoPago: m.metodoPago || 'Efectivo',
          fechaHora: m.fechaSalida,
        });
      }
    });

    return registros.sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());
  }
}
