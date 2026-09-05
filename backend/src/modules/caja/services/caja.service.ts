import { CajaRepository } from '../repositories/caja.repository.js';
import {
  CajaResumenDTO,
  GastoEntity,
  RegistrarGastoDTO,
  RecaudadorItemDTO,
  CajaDetalleDTO,
  HistorialDiaCajaDTO,
} from '../types/caja.types.js';

export class CajaService {
  private repository: CajaRepository;

  constructor() {
    this.repository = new CajaRepository();
  }

  async obtenerResumenCaja(fechaStr?: string): Promise<CajaResumenDTO> {
    const fecha = fechaStr || new Date().toISOString().split('T')[0];

    const { ingresos, totalOperaciones } = await this.repository.obtenerIngresosPorMetodo(fecha);
    const gastosList = await this.repository.obtenerGastosPorFecha(fecha);
    const totalGastos = gastosList.reduce((acc, g) => acc + g.monto, 0);

    const balanceNeto = parseFloat((ingresos.total - totalGastos).toFixed(2));

    return {
      fecha,
      ingresos,
      gastos: {
        total: parseFloat(totalGastos.toFixed(2)),
      },
      balanceNeto,
      totalMovimientosCobrados: totalOperaciones,
    };
  }

  async registrarGasto(dto: RegistrarGastoDTO): Promise<GastoEntity> {
    if (!dto.descripcion || !dto.descripcion.trim()) {
      throw new Error('La descripción del gasto es obligatoria.');
    }

    if (typeof dto.monto !== 'number' || isNaN(dto.monto) || dto.monto <= 0) {
      throw new Error('El monto del gasto debe ser un número positivo mayor a S/ 0.00.');
    }

    return await this.repository.registrarGasto({
      descripcion: dto.descripcion.trim(),
      monto: parseFloat(dto.monto.toFixed(2)),
      usuarioId: dto.usuarioId || 1,
      usuarioNombre: dto.usuarioNombre || 'Administrador',
    });
  }

  async obtenerGastos(fechaStr?: string): Promise<GastoEntity[]> {
    const fecha = fechaStr || new Date().toISOString().split('T')[0];
    return await this.repository.obtenerGastosPorFecha(fecha);
  }

  async obtenerRecaudadores(fechaStr?: string): Promise<RecaudadorItemDTO[]> {
    const fecha = fechaStr || new Date().toISOString().split('T')[0];
    return await this.repository.obtenerRecaudadoresPorFecha(fecha);
  }

  async obtenerDetalleDiario(fechaStr?: string): Promise<CajaDetalleDTO> {
    const fecha = fechaStr || new Date().toISOString().split('T')[0];

    const movimientos = await this.repository.obtenerMovimientosCobradosPorFecha(fecha);
    const gastos = await this.repository.obtenerGastosPorFecha(fecha);

    return {
      fecha,
      movimientos,
      gastos,
    };
  }

  async obtenerHistorial30Dias(dias: number = 30): Promise<HistorialDiaCajaDTO[]> {
    const numDias = Math.max(1, Math.min(365, dias));
    return await this.repository.obtenerHistorial30Dias(numDias);
  }
}
