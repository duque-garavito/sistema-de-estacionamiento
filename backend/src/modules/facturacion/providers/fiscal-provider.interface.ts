import {
  ComprobanteFiscalEntity,
  RespuestaFiscalDTO,
  EstadoSunat,
} from '../types/facturacion.types.js';

export interface FiscalProvider {
  emitir(cpe: ComprobanteFiscalEntity): Promise<RespuestaFiscalDTO>;
  consultar(tipoComprobante: string, serie: string, correlativo: number): Promise<RespuestaFiscalDTO>;
  anular(tipoComprobante: string, serie: string, correlativo: number, motivo: string): Promise<RespuestaFiscalDTO>;
  obtenerCdr(tipoComprobante: string, serie: string, correlativo: number): Promise<string | null>;
  verificarEstado(tipoComprobante: string, serie: string, correlativo: number): Promise<EstadoSunat>;
}
