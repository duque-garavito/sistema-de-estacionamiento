export type TipoVehiculoTarifa = 'Auto' | 'Camioneta' | 'Moto' | 'Bicicleta';
export type TipoCobroTarifa = 'HORA' | 'DIA' | 'MIXTO';

export interface Tarifa {
  id: number;
  tipoVehiculo: TipoVehiculoTarifa;
  tipoCobro: TipoCobroTarifa;
  precioHora: number;
  precioDia: number;
  toleranciaMinutos: number;
  fraccion15min: number;
  activo: boolean;
}
