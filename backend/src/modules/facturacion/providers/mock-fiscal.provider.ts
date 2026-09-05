import { FiscalProvider } from './fiscal-provider.interface.js';
import {
  ComprobanteFiscalEntity,
  RespuestaFiscalDTO,
  EstadoSunat,
} from '../types/facturacion.types.js';
import crypto from 'crypto';

export class MockFiscalProvider implements FiscalProvider {
  async emitir(cpe: ComprobanteFiscalEntity): Promise<RespuestaFiscalDTO> {
    // Generar DigestValue (hash de representación de firma XMLDSIG)
    const seed = `${cpe.tipoComprobante}-${cpe.serie}-${cpe.correlativo}-${cpe.total}-${Date.now()}`;
    const digestValue = crypto.createHash('sha256').update(seed).digest('base64');

    // Construir Cadena QR oficial RS N° 113-2018/SUNAT
    // RUC_EMISOR|TIPO_DOC|SERIE|CORRELATIVO|IGV|TOTAL|FECHA_EMISION|TIPO_DOC_CLIENTE|NUM_DOC_CLIENTE|DIGEST_VALUE
    const rucEmisor = '20123456789';
    const fechaEmisionStr = cpe.fechaEmision ? cpe.fechaEmision.split('T')[0] : new Date().toISOString().split('T')[0];
    const cadenaQr = `${rucEmisor}|${cpe.tipoComprobante}|${cpe.serie}|${cpe.correlativo}|${cpe.igv.toFixed(2)}|${cpe.total.toFixed(2)}|${fechaEmisionStr}|${cpe.clienteTipoDoc}|${cpe.clienteNumDoc}|${digestValue}`;

    // Simulación de CDR ACEPTADO por SUNAT / OSE
    return {
      exito: true,
      estadoSunat: 'ACEPTADO',
      codigoRespuesta: '0',
      mensajeRespuesta: 'El Comprobante numero ' + cpe.serie + '-' + cpe.correlativo + ' ha sido ACEPTADO por SUNAT',
      digestValue,
      cadenaQr,
      xmlMockPath: `storage/facturacion/xml/${rucEmisor}-${cpe.tipoComprobante}-${cpe.serie}-${cpe.correlativo}.xml`,
      cdrMockPath: `storage/facturacion/cdr/R-${rucEmisor}-${cpe.tipoComprobante}-${cpe.serie}-${cpe.correlativo}.xml`,
    };
  }

  async consultar(tipoComprobante: string, serie: string, correlativo: number): Promise<RespuestaFiscalDTO> {
    return {
      exito: true,
      estadoSunat: 'ACEPTADO',
      codigoRespuesta: '0',
      mensajeRespuesta: `Comprobante ${serie}-${correlativo} existe y está ACEPTADO`,
    };
  }

  async anular(tipoComprobante: string, serie: string, correlativo: number, motivo: string): Promise<RespuestaFiscalDTO> {
    return {
      exito: true,
      estadoSunat: 'ANULADO',
      codigoRespuesta: '0',
      mensajeRespuesta: `Comprobante ${serie}-${correlativo} anulación procesada por SUNAT`,
    };
  }

  async obtenerCdr(tipoComprobante: string, serie: string, correlativo: number): Promise<string | null> {
    return `<CDRMock><Estado>0</Estado><Mensaje>Comprobante ${serie}-${correlativo} Aceptado OK</Mensaje></CDRMock>`;
  }

  async verificarEstado(tipoComprobante: string, serie: string, correlativo: number): Promise<EstadoSunat> {
    return 'ACEPTADO';
  }
}
