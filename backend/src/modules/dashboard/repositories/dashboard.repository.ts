import { dbPool } from '../../../core/config/database.js';
import { CajaRepository } from '../../caja/repositories/caja.repository.js';
import { MovimientoRepository } from '../../movimientos/repositories/movimiento.repository.js';
import { DashboardStatsDTO } from '../types/dashboard.types.js';

export class DashboardRepository {
  private cajaRepo = new CajaRepository();
  private movRepo = new MovimientoRepository();

  async obtenerStatsConsolidadas(): Promise<DashboardStatsDTO> {
    const hoyStr = new Date().toISOString().split('T')[0];

    // 1. Ingresos y operaciones de caja
    const resumenIngresos = await this.cajaRepo.obtenerIngresosPorMetodo(hoyStr);
    const gastos = await this.cajaRepo.obtenerGastosPorFecha(hoyStr);
    const totalGastosHoy = gastos.reduce((sum, g) => sum + g.monto, 0);

    // 2. Movimientos activos en cochera
    const activos = await this.movRepo.findActivos();
    const vehiculosParqueados = activos.length;

    // 3. Últimas entradas y salidas
    let ultimasEntradas: any[] = [];
    let ultimasSalidas: any[] = [];
    let totalMovimientosHoy = 0;

    try {
      // Query MySQL de entradas de hoy
      const [entradasRows]: any = await dbPool.query(
        `SELECT id, placa, tipo_vehiculo, fecha_entrada, momento_pago 
         FROM movimientos 
         WHERE DATE(fecha_entrada) = ? 
         ORDER BY fecha_entrada DESC LIMIT 5`,
        [hoyStr]
      );

      // Query MySQL de salidas completadas de hoy
      const [salidasRows]: any = await dbPool.query(
        `SELECT id, placa, tipo_vehiculo, fecha_salida, total_pagar, metodo_pago 
         FROM movimientos 
         WHERE estado = 'Completado' AND fecha_salida IS NOT NULL AND DATE(fecha_salida) = ? 
         ORDER BY fecha_salida DESC LIMIT 5`,
        [hoyStr]
      );

      const [countRows]: any = await dbPool.query(
        `SELECT COUNT(*) as total FROM movimientos WHERE DATE(fecha_entrada) = ? OR DATE(fecha_salida) = ?`,
        [hoyStr, hoyStr]
      );

      if (Array.isArray(entradasRows) && entradasRows.length > 0) {
        ultimasEntradas = entradasRows.map((r: any) => ({
          id: String(r.id),
          placa: r.placa,
          tipoVehiculo: r.tipo_vehiculo,
          fechaEntrada: r.fecha_entrada,
          momentoPago: r.momento_pago,
        }));
      }

      if (Array.isArray(salidasRows) && salidasRows.length > 0) {
        ultimasSalidas = salidasRows.map((r: any) => ({
          id: String(r.id),
          placa: r.placa,
          tipoVehiculo: r.tipo_vehiculo,
          fechaSalida: r.fecha_salida,
          totalPagar: Number(r.total_pagar || 0),
          metodoPago: r.metodo_pago,
        }));
      }

      if (Array.isArray(countRows) && countRows.length > 0) {
        totalMovimientosHoy = Number(countRows[0].total || 0);
      }
    } catch {
      // Fallback local memoryStore
      const todosMovs = await this.movRepo.findHistorial();
      
      const entradasHoy = todosMovs
        .filter((m: any) => new Date(m.fechaEntrada).toISOString().split('T')[0] === hoyStr)
        .sort((a: any, b: any) => new Date(b.fechaEntrada).getTime() - new Date(a.fechaEntrada).getTime());

      const salidasHoy = todosMovs
        .filter((m: any) => m.estado === 'Completado' && m.fechaSalida && new Date(m.fechaSalida).toISOString().split('T')[0] === hoyStr)
        .sort((a: any, b: any) => new Date(b.fechaSalida!).getTime() - new Date(a.fechaSalida!).getTime());

      totalMovimientosHoy = entradasHoy.length + salidasHoy.length;

      ultimasEntradas = entradasHoy.slice(0, 5).map((r: any) => ({
        id: String(r.id),
        placa: r.placa,
        tipoVehiculo: r.tipoVehiculo,
        fechaEntrada: r.fechaEntrada,
        momentoPago: r.momentoPago,
      }));

      ultimasSalidas = salidasHoy.slice(0, 5).map((r: any) => ({
        id: String(r.id),
        placa: r.placa,
        tipoVehiculo: r.tipoVehiculo,
        fechaSalida: r.fechaSalida!,
        totalPagar: r.totalPagar || 0,
        metodoPago: r.metodoPago,
      }));
    }

    const ingresosHoy = resumenIngresos.ingresos.total;
    const balanceHoy = parseFloat((ingresosHoy - totalGastosHoy).toFixed(2));

    return {
      vehiculosParqueados,
      capacidadTotal: 50,
      ingresosHoy,
      gastosHoy: parseFloat(totalGastosHoy.toFixed(2)),
      balanceHoy,
      totalMovimientosHoy,
      cajaAbierta: true,
      metodosPago: resumenIngresos.ingresos,
      ultimasEntradas,
      ultimasSalidas,
    };
  }
}
