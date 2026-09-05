export type TipoVehiculoBackend = 'Auto' | 'Camioneta' | 'Moto' | 'Bicicleta';
export type EstadoMovimientoBackend = 'Activo' | 'Completado' | 'Anulado';
export type MomentoPagoBackend = 'ENTRADA' | 'SALIDA';

export interface MovimientoEntity {
  id: string;
  codigoTicket: string;
  placa: string;
  tipoVehiculo: TipoVehiculoBackend;
  color?: string;
  marcaModelo?: string;
  propietarioDni?: string;
  propietarioNombre?: string;
  fechaEntrada: Date;
  fechaSalida?: Date;
  tarifaDiaAplicada: number;
  diasCobrados?: number;
  totalPagar?: number;
  momentoPago: MomentoPagoBackend;
  metodoPago?: string;
  usuarioIngreso?: string;
  usuarioSalida?: string;
  estado: EstadoMovimientoBackend;
  ubicacion?: string;
  observaciones?: string;
}

export interface RegistrarEntradaDTO {
  placa: string;
  tipoVehiculo: TipoVehiculoBackend;
  color?: string;
  marcaModelo?: string;
  propietarioDni?: string;
  propietarioNombre?: string;
  ubicacion?: string;
  momentoPago?: MomentoPagoBackend;
  metodoPago?: string;
  usuarioIngreso?: string;
  observaciones?: string;
}

export interface RegistrarSalidaDTO {
  movimientoId: string;
  metodoPago?: string;
  descuento?: number;
  usuarioSalida?: string;
}

export interface ActualizarInfoMovimientoDTO {
  color?: string;
  marcaModelo?: string;
  propietarioDni?: string;
  propietarioNombre?: string;
  ubicacion?: string;
  observaciones?: string;
}

