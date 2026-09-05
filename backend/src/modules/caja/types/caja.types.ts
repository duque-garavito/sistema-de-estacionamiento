export interface IngresosPorMetodo {
  efectivo: number;
  yape: number;
  plin: number;
  tarjeta: number;
  total: number;
}

export interface GastosResumen {
  total: number;
}

export interface CajaResumenDTO {
  fecha: string;
  ingresos: IngresosPorMetodo;
  gastos: GastosResumen;
  balanceNeto: number;
  totalMovimientosCobrados: number;
}

export interface GastoEntity {
  id: number;
  descripcion: string;
  monto: number;
  usuarioId: number;
  usuarioNombre: string;
  fechaHora: Date;
}

export interface RegistrarGastoDTO {
  descripcion: string;
  monto: number;
  usuarioId?: number;
  usuarioNombre?: string;
}

export interface RecaudadorItemDTO {
  usuarioId: number | string;
  usuarioNombre: string;
  totalCobrado: number;
  cantidadOperaciones: number;
}

export interface CajaDetalleMovimientoItem {
  id: string;
  codigoTicket: string;
  placa: string;
  tipoVehiculo: string;
  momentoPago: 'ENTRADA' | 'SALIDA';
  metodoPago: string;
  importe: number;
  operadorNombre: string;
  fechaHoraRealPago: Date;
}

export interface CajaDetalleDTO {
  fecha: string;
  movimientos: CajaDetalleMovimientoItem[];
  gastos: GastoEntity[];
}

export interface HistorialDiaCajaDTO {
  fecha: string;
  efectivo: number;
  yape: number;
  plin: number;
  tarjeta: number;
  ingresosTotal: number;
  gastosTotal: number;
  balanceNeto: number;
}
