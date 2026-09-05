export type TipoVehiculo = 'Auto' | 'Camioneta' | 'Moto' | 'Bicicleta';
export type EstadoMovimiento = 'Activo' | 'Completado' | 'Anulado';
export type MomentoPago = 'ENTRADA' | 'SALIDA';

export interface Movimiento {
  id: string;
  codigoTicket?: string;
  placa: string;
  tipoVehiculo: TipoVehiculo;
  color?: string;
  marcaModelo?: string;
  propietarioDni?: string;
  propietarioNombre?: string;
  fechaEntrada: string; // ISO String
  fechaSalida?: string; // ISO String
  tarifaDiaAplicada: number;
  diasCobrados?: number;
  totalPagar?: number;
  momentoPago: MomentoPago;
  metodoPago?: string;
  usuarioIngreso?: string;
  usuarioSalida?: string;
  estado: EstadoMovimiento;
  ubicacion?: string;
  observaciones?: string;
}

export interface EntradaDTO {
  placa: string;
  tipoVehiculo: TipoVehiculo;
  color?: string;
  marcaModelo?: string;
  propietarioDni?: string;
  propietarioNombre?: string;
  ubicacion?: string;
  momentoPago?: MomentoPago;
  metodoPago?: string;
  usuarioIngreso?: string;
  observaciones?: string;
}

export interface SalidaDTO {
  movimientoId: string;
  descuento?: number;
  metodoPago?: string;
  usuarioSalida?: string;
}
