import { TarifaRepository } from '../repositories/tarifa.repository.js';
import { TarifaEntity, TipoVehiculoTarifa, ActualizarTarifaDTO } from '../types/tarifa.types.js';

export interface CalculoCobroDiaResultado {
  diasCobrados: number;
  totalPagar: number;
  tarifaDiaAplicada: number;
  tiempoTexto: string;
  yaPagadoEnEntrada: boolean;
}

export class TarifaService {
  private repository: TarifaRepository;

  constructor() {
    this.repository = new TarifaRepository();
  }

  async obtenerTarifas(): Promise<TarifaEntity[]> {
    return await this.repository.findAll();
  }

  async obtenerTarifaPorTipo(tipo: TipoVehiculoTarifa): Promise<TarifaEntity> {
    const tarifa = await this.repository.findByTipoVehiculo(tipo);
    if (!tarifa) {
      return {
        id: 0,
        tipoVehiculo: tipo,
        tipoCobro: 'DIA',
        precioHora: 5.0,
        precioDia: 10.0,
        toleranciaMinutos: 10,
        fraccion15min: 1.5,
        activo: true,
      };
    }
    return tarifa;
  }

  async actualizarTarifa(dto: ActualizarTarifaDTO): Promise<TarifaEntity> {
    const tarifaActualizada = await this.repository.updateTarifa(dto);
    if (!tarifaActualizada) {
      throw new Error('No se pudo actualizar la tarifa especificada.');
    }
    return tarifaActualizada;
  }

  /**
   * Cálculo de Cobro por Día (Regla Legacy PHP):
   * 1. Mismo día calendario = 1 día cobrado.
   * 2. Días diferentes = (diferencia de días calendario + 1).
   * 3. Si ya fue pagado en Entrada (momentoPago === 'ENTRADA'), el saldo a cobrar en Salida es S/ 0.00.
   */
  async calcularCobroPorDia(
    fechaEntrada: Date,
    fechaSalida: Date,
    tarifaDiaAplicada: number,
    momentoPago: 'ENTRADA' | 'SALIDA' = 'SALIDA',
    descuento: number = 0
  ): Promise<CalculoCobroDiaResultado> {
    const entradaYear = fechaEntrada.getFullYear();
    const entradaMonth = fechaEntrada.getMonth();
    const entradaDate = fechaEntrada.getDate();

    const salidaYear = fechaSalida.getFullYear();
    const salidaMonth = fechaSalida.getMonth();
    const salidaDate = fechaSalida.getDate();

    const esMismoDia = (entradaYear === salidaYear && entradaMonth === salidaMonth && entradaDate === salidaDate);

    let diasCobrados = 1;
    if (!esMismoDia) {
      // Normalizar a medianoche para cálculo estricto de diferencia en días calendario
      const startMidnight = new Date(entradaYear, entradaMonth, entradaDate).getTime();
      const endMidnight = new Date(salidaYear, salidaMonth, salidaDate).getTime();
      const diffDaysCalendar = Math.round((endMidnight - startMidnight) / (1000 * 60 * 60 * 24));
      diasCobrados = Math.max(1, diffDaysCalendar + 1);
    }

    const yaPagadoEnEntrada = (momentoPago === 'ENTRADA');
    let totalPagar = 0;

    if (!yaPagadoEnEntrada) {
      const subtotal = diasCobrados * tarifaDiaAplicada;
      totalPagar = Math.max(0, parseFloat((subtotal - descuento).toFixed(2)));
    }

    return {
      diasCobrados,
      totalPagar,
      tarifaDiaAplicada,
      tiempoTexto: `${diasCobrados} día(s) acumulado(s)`,
      yaPagadoEnEntrada,
    };
  }
}
