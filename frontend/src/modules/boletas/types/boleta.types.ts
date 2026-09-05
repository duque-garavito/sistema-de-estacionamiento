export type TipoComprobante = 'TICKET' | 'BOLETA' | 'FACTURA';
export type MetodoPago = 'Efectivo' | 'Yape' | 'Plin' | 'Tarjeta';
export type TipoDocumentoCliente = 'DNI' | 'RUC' | 'VARIOS';

export interface EmpresaConfig {
  id: number;
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  direccion: string;
  telefono: string;
  serieBoleta: string;
  correlativoBoleta: number;
  serieFactura: string;
  correlativoFactura: number;
  leyendaTicket: string;
  actualizadoEn?: string;
}

export interface Boleta {
  id: string;
  numeroTicket: string;
  movimientoId?: string | null;
  cajaId?: number | null;
  tipoComprobante: TipoComprobante;
  serie: string;
  correlativo: number;
  clienteTipoDoc: TipoDocumentoCliente;
  clienteNumDoc: string;
  clienteNombre: string;
  clienteDireccion?: string;
  placa: string;
  tipoVehiculo: string;
  fechaIngreso: string;
  fechaSalida: string;
  tiempoTotalFormatted: string;
  subtotal: number;
  igv: number;
  total: number;
  metodoPago: MetodoPago;
  cajero: string;
  fechaEmision: string;
}

export interface EmitirComprobanteDTO {
  movimientoId?: string;
  placa: string;
  tipoVehiculo: string;
  fechaIngreso: string;
  fechaSalida: string;
  total: number;
  metodoPago: MetodoPago;
  tipoComprobante?: TipoComprobante;
  clienteTipoDoc?: TipoDocumentoCliente;
  clienteNumDoc?: string;
  clienteNombre?: string;
  clienteDireccion?: string;
  cajero?: string;
}
