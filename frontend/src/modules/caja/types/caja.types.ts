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

export interface CajaResumen {
  fecha: string;
  ingresos: IngresosPorMetodo;
  gastos: GastosResumen;
  balanceNeto: number;
  totalMovimientosCobrados: number;
}

export interface Gasto {
  id: number;
  descripcion: string;
  monto: number;
  usuarioId: number;
  usuarioNombre: string;
  fechaHora: string;
}

export interface RegistrarGastoDTO {
  descripcion: string;
  monto: number;
  usuarioId?: number;
  usuarioNombre?: string;
}

export interface RecaudadorItem {
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
  fechaHoraRealPago: string;
}

export interface CajaDetalle {
  fecha: string;
  movimientos: CajaDetalleMovimientoItem[];
  gastos: Gasto[];
}

export interface HistorialDiaCaja {
  fecha: string;
  efectivo: number;
  yape: number;
  plin: number;
  tarjeta: number;
  ingresosTotal: number;
  gastosTotal: number;
  balanceNeto: number;
}
