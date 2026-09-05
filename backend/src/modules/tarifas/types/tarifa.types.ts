export type TipoVehiculoTarifa = 'Auto' | 'Camioneta' | 'Moto' | 'Bicicleta';
export type TipoCobroTarifa = 'HORA' | 'DIA' | 'MIXTO';

export interface TarifaEntity {
  id: number;
  tipoVehiculo: TipoVehiculoTarifa;
  tipoCobro: TipoCobroTarifa;
  precioHora: number;
  precioDia: number;
  toleranciaMinutos: number;
  fraccion15min: number;
  activo: boolean;
  actualizadoEn?: Date;
}

export interface ActualizarTarifaDTO {
  tipoVehiculo: TipoVehiculoTarifa;
  tipoCobro: TipoCobroTarifa;
  precioHora: number;
  precioDia: number;
  toleranciaMinutos: number;
  fraccion15min: number;
  activo: boolean;
}

export interface CalculoCobroResultado {
  totalPagar: number;
  tiempoTranscurridoText: string;
  unidadesCobradas: number;
  unidadMedida: 'DÍAS' | 'HORAS';
  tarifaAplicada: TarifaEntity;
}
