import { dbPool } from '../../../core/config/database.js';
import { TarifaEntity, TipoVehiculoTarifa, ActualizarTarifaDTO } from '../types/tarifa.types.js';

export class TarifaRepository {
  private static memoryStore: TarifaEntity[] = [
    { id: 1, tipoVehiculo: 'Auto', tipoCobro: 'DIA', precioHora: 5.0, precioDia: 10.0, toleranciaMinutos: 10, fraccion15min: 1.5, activo: true },
    { id: 2, tipoVehiculo: 'Camioneta', tipoCobro: 'DIA', precioHora: 7.0, precioDia: 15.0, toleranciaMinutos: 10, fraccion15min: 2.0, activo: true },
    { id: 3, tipoVehiculo: 'Moto', tipoCobro: 'DIA', precioHora: 3.0, precioDia: 5.0, toleranciaMinutos: 10, fraccion15min: 1.0, activo: true },
    { id: 4, tipoVehiculo: 'Bicicleta', tipoCobro: 'DIA', precioHora: 1.5, precioDia: 3.0, toleranciaMinutos: 10, fraccion15min: 0.5, activo: true },
  ];

  async findAll(): Promise<TarifaEntity[]> {
    try {
      const [rows] = await dbPool.query('SELECT * FROM tarifas ORDER BY id ASC');
      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map((r: any) => ({
          id: r.id,
          tipoVehiculo: r.tipo_vehiculo,
          tipoCobro: r.tipo_cobro || 'DIA',
          precioHora: Number(r.precio_hora),
          precioDia: Number(r.precio_dia || 10.0),
          toleranciaMinutos: Number(r.tolerancia_minutos),
          fraccion15min: Number(r.fraccion_15min || 1.5),
          activo: Boolean(r.activo ?? 1),
        }));
      }
    } catch {
      // Fallback a memoria local si MySQL no está listo
    }
    return TarifaRepository.memoryStore;
  }

  async findByTipoVehiculo(tipo: TipoVehiculoTarifa): Promise<TarifaEntity | null> {
    const tarifas = await this.findAll();
    const encontrada = tarifas.find((t) => t.tipoVehiculo === tipo);
    return encontrada || null;
  }

  async updateTarifa(dto: ActualizarTarifaDTO): Promise<TarifaEntity | null> {
    try {
      await dbPool.query(
        `UPDATE tarifas 
         SET tipo_cobro = ?, precio_hora = ?, precio_dia = ?, tolerancia_minutos = ?, fraccion_15min = ?, activo = ? 
         WHERE tipo_vehiculo = ?`,
        [dto.tipoCobro, dto.precioHora, dto.precioDia, dto.toleranciaMinutos, dto.fraccion15min, dto.activo ? 1 : 0, dto.tipoVehiculo]
      );
    } catch {
      // Fallback local
    }
    const tarifa = TarifaRepository.memoryStore.find((t) => t.tipoVehiculo === dto.tipoVehiculo);
    if (tarifa) {
      tarifa.tipoCobro = dto.tipoCobro;
      tarifa.precioHora = dto.precioHora;
      tarifa.precioDia = dto.precioDia;
      tarifa.toleranciaMinutos = dto.toleranciaMinutos;
      tarifa.fraccion15min = dto.fraccion15min;
      tarifa.activo = dto.activo;
    }
    return tarifa || null;
  }
}
