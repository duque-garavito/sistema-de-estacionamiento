export type TipoComprobanteFiscal = '01' | '03' | '07' | '08'; // 01: Factura, 03: Boleta, 07: NC, 08: ND
export type TipoDocCliente = '6' | '1' | '0'; // 6: RUC, 1: DNI, 0: VARIOS
export type EstadoSunat = 'BORRADOR' | 'GENERADO' | 'ENVIADO' | 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO' | 'ANULADO';

export interface ComprobanteFiscalEntity {
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
  xmlPath?: string | null;
  cdrPath?: string | null;
  usuarioId: number;
  createdAt?: string;
}

export interface EmitirComprobanteDTO {
  movimientoId?: number;
  tipoComprobante: TipoComprobanteFiscal; // '01' o '03'
  clienteTipoDoc: TipoDocCliente;
  clienteNumDoc: string;
  clienteNombre: string;
  clienteDireccion?: string;
  total: number;
  metodoPago: string;
  usuarioId?: number;
}

export interface RespuestaFiscalDTO {
  exito: boolean;
  estadoSunat: EstadoSunat;
  codigoRespuesta?: string;
  mensajeRespuesta?: string;
  digestValue?: string;
  cadenaQr?: string;
  xmlMockPath?: string;
  cdrMockPath?: string;
}
