export type TipoComprobanteFiscal = '01' | '03' | '07' | '08';
export type TipoDocCliente = '6' | '1' | '0';
export type EstadoSunat = 'BORRADOR' | 'GENERADO' | 'ENVIADO' | 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO' | 'ANULADO';

export interface ComprobanteFiscal {
  id: number;
  movimientoId?: number | null;
  tipoComprobante: TipoComprobanteFiscal;
  serie: string;
  correlativo: number;
  fechaEmision: string;
  fechaEnvio?: string | null;
  fechaRespuesta?: string | null;
  clienteTipoDoc: TipoDocCliente;
  clienteNumDoc: string;
  clienteNombre: string;
  clienteDireccion?: string | null;
  moneda: string;
  opGravadas: number;
  opExoneradas: number;
  igv: number;
  total: number;
  metodoPago: string;
  estadoSunat: EstadoSunat;
  codigoRespuestaSunat?: string | null;
  mensajeRespuestaSunat?: string | null;
  digestValue?: string | null;
  codigoQr?: string | null;
}

export interface EmitirComprobanteDTO {
  movimientoId?: number;
  tipoComprobante: TipoComprobanteFiscal;
  clienteTipoDoc: TipoDocCliente;
  clienteNumDoc: string;
  clienteNombre: string;
  clienteDireccion?: string;
  total: number;
  metodoPago: string;
}
