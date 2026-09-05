import { dbPool } from '../../../core/config/database.js';
import { MovimientoRepository } from '../../movimientos/repositories/movimiento.repository.js';
import {
  GastoEntity,
  RegistrarGastoDTO,
  IngresosPorMetodo,
  RecaudadorItemDTO,
  CajaDetalleMovimientoItem,
  HistorialDiaCajaDTO,
} from '../types/caja.types.js';

export class CajaRepository {
  private static gastosMemoryStore: GastoEntity[] = [
    {
      id: 1,
      descripcion: 'Compra de papel térmico para tickets',
      monto: 15.0,
      usuarioId: 1,
      usuarioNombre: 'Administrador',
      fechaHora: new Date(Date.now() - 1000 * 60 * 180),
    },
  ];

  async registrarGasto(dto: RegistrarGastoDTO): Promise<GastoEntity> {
    const descripcion = dto.descripcion.trim();
    const monto = dto.monto;
    const usuarioId = dto.usuarioId || 1;
    const usuarioNombre = dto.usuarioNombre || 'Administrador';

    try {
      const [res]: any = await dbPool.query(
        'INSERT INTO gastos (descripcion, monto, usuario_id, usuario_nombre, fecha_hora) VALUES (?, ?, ?, ?, NOW())',
        [descripcion, monto, usuarioId, usuarioNombre]
      );
      return {
        id: res.insertId || Date.now(),
        descripcion,
        monto,
        usuarioId,
        usuarioNombre,
        fechaHora: new Date(),
      };
    } catch {
      // Fallback local
    }

    const nuevo: GastoEntity = {
      id: Date.now(),
      descripcion,
      monto,
      usuarioId,
      usuarioNombre,
      fechaHora: new Date(),
    };
    CajaRepository.gastosMemoryStore.unshift(nuevo);
    return nuevo;
  }

  async obtenerGastosPorFecha(fecha: string): Promise<GastoEntity[]> {
    try {
      const [rows] = await dbPool.query(
        'SELECT * FROM gastos WHERE DATE(fecha_hora) = ? ORDER BY fecha_hora DESC',
        [fecha]
      );
      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map((r: any) => ({
          id: r.id,
          descripcion: r.descripcion,
          monto: Number(r.monto),
          usuarioId: r.usuario_id,
          usuarioNombre: r.usuario_nombre,
          fechaHora: new Date(r.fecha_hora),
        }));
      }
    } catch {
      // Fallback local
    }

    return CajaRepository.gastosMemoryStore.filter((g) => {
      const gFecha = new Date(g.fechaHora).toISOString().split('T')[0];
      return gFecha === fecha;
    });
  }

  async obtenerIngresosPorMetodo(fecha: string): Promise<{ ingresos: IngresosPorMetodo; totalOperaciones: number }> {
    let efectivo = 0;
    let yape = 0;
    let plin = 0;
    let tarjeta = 0;
    let totalOperaciones = 0;

    try {
      const sql = `
        SELECT metodo_pago, SUM(monto_cobrado) as total, COUNT(*) as ops FROM (
          SELECT metodo_pago, tarifa_dia_aplicada as monto_cobrado
          FROM movimientos
          WHERE momento_pago = 'ENTRADA' AND DATE(fecha_entrada) = ?

          UNION ALL

          SELECT metodo_pago, total_pagar as monto_cobrado
          FROM movimientos
          WHERE momento_pago = 'SALIDA' AND fecha_salida IS NOT NULL AND DATE(fecha_salida) = ? AND estado = 'Completado'
        ) as unidos
        GROUP BY metodo_pago
      `;
      const [rows] = await dbPool.query(sql, [fecha, fecha]);
      if (Array.isArray(rows)) {
        rows.forEach((r: any) => {
          const metodo = (r.metodo_pago || 'Efectivo').toLowerCase();
          const monto = Number(r.total || 0);
          const ops = Number(r.ops || 0);
          totalOperaciones += ops;

          if (metodo.includes('efectivo')) efectivo += monto;
          else if (metodo.includes('yape')) yape += monto;
          else if (metodo.includes('plin')) plin += monto;
          else if (metodo.includes('tarjeta')) tarjeta += monto;
          else efectivo += monto;
        });

        return {
          ingresos: {
            efectivo: parseFloat(efectivo.toFixed(2)),
            yape: parseFloat(yape.toFixed(2)),
            plin: parseFloat(plin.toFixed(2)),
            tarjeta: parseFloat(tarjeta.toFixed(2)),
            total: parseFloat((efectivo + yape + plin + tarjeta).toFixed(2)),
          },
          totalOperaciones,
        };
      }
    } catch {
      // Fallback local desde MovimientoRepository memoryStore
    }

    // Procesar memoryStore de MovimientoRepository
    const movs = (MovimientoRepository as any).memoryStore || [];
    movs.forEach((m: any) => {
      if (m.momentoPago === 'ENTRADA') {
        const fechaEntradaStr = new Date(m.fechaEntrada).toISOString().split('T')[0];
        if (fechaEntradaStr === fecha) {
          const monto = m.tarifaDiaAplicada || 10.0;
          const metodo = (m.metodoPago || 'Efectivo').toLowerCase();
          totalOperaciones++;
          if (metodo.includes('efectivo')) efectivo += monto;
          else if (metodo.includes('yape')) yape += monto;
          else if (metodo.includes('plin')) plin += monto;
          else if (metodo.includes('tarjeta')) tarjeta += monto;
          else efectivo += monto;
        }
      } else if (m.momentoPago === 'SALIDA' && m.estado === 'Completado' && m.fechaSalida) {
        const fechaSalidaStr = new Date(m.fechaSalida).toISOString().split('T')[0];
        if (fechaSalidaStr === fecha) {
          const monto = m.totalPagar || 0;
          const metodo = (m.metodoPago || 'Efectivo').toLowerCase();
          totalOperaciones++;
          if (metodo.includes('efectivo')) efectivo += monto;
          else if (metodo.includes('yape')) yape += monto;
          else if (metodo.includes('plin')) plin += monto;
          else if (metodo.includes('tarjeta')) tarjeta += monto;
          else efectivo += monto;
        }
      }
    });

    return {
      ingresos: {
        efectivo: parseFloat(efectivo.toFixed(2)),
        yape: parseFloat(yape.toFixed(2)),
        plin: parseFloat(plin.toFixed(2)),
        tarjeta: parseFloat(tarjeta.toFixed(2)),
        total: parseFloat((efectivo + yape + plin + tarjeta).toFixed(2)),
      },
      totalOperaciones,
    };
  }

  async obtenerRecaudadoresPorFecha(fecha: string): Promise<RecaudadorItemDTO[]> {
    const mapa = new Map<string, { total: number; ops: number }>();

    try {
      const sql = `
        SELECT usuario_cobro, SUM(monto_cobrado) as total, COUNT(*) as ops FROM (
          SELECT usuario_ingreso as usuario_cobro, tarifa_dia_aplicada as monto_cobrado
          FROM movimientos
          WHERE momento_pago = 'ENTRADA' AND DATE(fecha_entrada) = ?

          UNION ALL

          SELECT COALESCE(usuario_salida, 'Operador Salida') as usuario_cobro, total_pagar as monto_cobrado
          FROM movimientos
          WHERE momento_pago = 'SALIDA' AND fecha_salida IS NOT NULL AND DATE(fecha_salida) = ? AND estado = 'Completado'
        ) as unidos
        GROUP BY usuario_cobro
      `;
      const [rows] = await dbPool.query(sql, [fecha, fecha]);
      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map((r: any, index: number) => ({
          usuarioId: index + 1,
          usuarioNombre: r.usuario_cobro || 'Operador',
          totalCobrado: parseFloat(Number(r.total).toFixed(2)),
          cantidadOperaciones: Number(r.ops),
        }));
      }
    } catch {
      // Fallback local
    }

    const movs = (MovimientoRepository as any).memoryStore || [];
    movs.forEach((m: any) => {
      if (m.momentoPago === 'ENTRADA') {
        const fStr = new Date(m.fechaEntrada).toISOString().split('T')[0];
        if (fStr === fecha) {
          const user = m.usuarioIngreso || 'Operador Entrada';
          const prev = mapa.get(user) || { total: 0, ops: 0 };
          mapa.set(user, { total: prev.total + (m.tarifaDiaAplicada || 10.0), ops: prev.ops + 1 });
        }
      } else if (m.momentoPago === 'SALIDA' && m.estado === 'Completado' && m.fechaSalida) {
        const fStr = new Date(m.fechaSalida).toISOString().split('T')[0];
        if (fStr === fecha) {
          const user = m.usuarioSalida || 'Operador Salida';
          const prev = mapa.get(user) || { total: 0, ops: 0 };
          mapa.set(user, { total: prev.total + (m.totalPagar || 0), ops: prev.ops + 1 });
        }
      }
    });

    const resultado: RecaudadorItemDTO[] = [];
    let idx = 1;
    mapa.forEach((val, key) => {
      resultado.push({
        usuarioId: idx++,
        usuarioNombre: key,
        totalCobrado: parseFloat(val.total.toFixed(2)),
        cantidadOperaciones: val.ops,
      });
    });

    return resultado;
  }

  async obtenerMovimientosCobradosPorFecha(fecha: string): Promise<CajaDetalleMovimientoItem[]> {
    const lista: CajaDetalleMovimientoItem[] = [];

    const movs = (MovimientoRepository as any).memoryStore || [];
    movs.forEach((m: any) => {
      if (m.momentoPago === 'ENTRADA') {
        const fStr = new Date(m.fechaEntrada).toISOString().split('T')[0];
        if (fStr === fecha) {
          lista.push({
            id: String(m.id),
            codigoTicket: m.codigoTicket || 'TKT-000',
            placa: m.placa,
            tipoVehiculo: m.tipoVehiculo,
            momentoPago: 'ENTRADA',
            metodoPago: m.metodoPago || 'Efectivo',
            importe: m.tarifaDiaAplicada || 10.0,
            operadorNombre: m.usuarioIngreso || 'Operador Entrada',
            fechaHoraRealPago: new Date(m.fechaEntrada),
          });
        }
      } else if (m.momentoPago === 'SALIDA' && m.estado === 'Completado' && m.fechaSalida) {
        const fStr = new Date(m.fechaSalida).toISOString().split('T')[0];
        if (fStr === fecha) {
          lista.push({
            id: String(m.id),
            codigoTicket: m.codigoTicket || 'TKT-000',
            placa: m.placa,
            tipoVehiculo: m.tipoVehiculo,
            momentoPago: 'SALIDA',
            metodoPago: m.metodoPago || 'Efectivo',
            importe: m.totalPagar || 0,
            operadorNombre: m.usuarioSalida || 'Operador Salida',
            fechaHoraRealPago: new Date(m.fechaSalida),
          });
        }
      }
    });

    return lista;
  }

  async obtenerHistorial30Dias(dias: number = 30): Promise<HistorialDiaCajaDTO[]> {
    const mapa = new Map<string, HistorialDiaCajaDTO>();

    const hoy = new Date();
    for (let i = 0; i < dias; i++) {
      const d = new Date(hoy.getTime() - i * 24 * 60 * 60 * 1000);
      const fStr = d.toISOString().split('T')[0];
      mapa.set(fStr, {
        fecha: fStr,
        efectivo: 0,
        yape: 0,
        plin: 0,
        tarjeta: 0,
        ingresosTotal: 0,
        gastosTotal: 0,
        balanceNeto: 0,
      });
    }

    // Procesar gastos
    const gastos = CajaRepository.gastosMemoryStore;
    gastos.forEach((g) => {
      const fStr = new Date(g.fechaHora).toISOString().split('T')[0];
      if (mapa.has(fStr)) {
        const item = mapa.get(fStr)!;
        item.gastosTotal = parseFloat((item.gastosTotal + g.monto).toFixed(2));
      }
    });

    // Procesar ingresos por momentoPago
    const movs = (MovimientoRepository as any).memoryStore || [];
    movs.forEach((m: any) => {
      let fStr = '';
      let monto = 0;

      if (m.momentoPago === 'ENTRADA') {
        fStr = new Date(m.fechaEntrada).toISOString().split('T')[0];
        monto = m.tarifaDiaAplicada || 10.0;
      } else if (m.momentoPago === 'SALIDA' && m.estado === 'Completado' && m.fechaSalida) {
        fStr = new Date(m.fechaSalida).toISOString().split('T')[0];
        monto = m.totalPagar || 0;
      }

      if (fStr && mapa.has(fStr)) {
        const item = mapa.get(fStr)!;
        const metodo = (m.metodoPago || 'Efectivo').toLowerCase();
        if (metodo.includes('efectivo')) item.efectivo = parseFloat((item.efectivo + monto).toFixed(2));
        else if (metodo.includes('yape')) item.yape = parseFloat((item.yape + monto).toFixed(2));
        else if (metodo.includes('plin')) item.plin = parseFloat((item.plin + monto).toFixed(2));
        else if (metodo.includes('tarjeta')) item.tarjeta = parseFloat((item.tarjeta + monto).toFixed(2));
        else item.efectivo = parseFloat((item.efectivo + monto).toFixed(2));

        item.ingresosTotal = parseFloat((item.efectivo + item.yape + item.plin + item.tarjeta).toFixed(2));
      }
    });

    // Recalcular balance
    const resultado: HistorialDiaCajaDTO[] = [];
    mapa.forEach((val) => {
      val.balanceNeto = parseFloat((val.ingresosTotal - val.gastosTotal).toFixed(2));
      resultado.push(val);
    });

    return resultado.sort((a, b) => b.fecha.localeCompare(a.fecha));
  }
}
