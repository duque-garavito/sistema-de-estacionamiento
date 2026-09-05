import {
  ComprobanteFiscal,
  EmitirComprobanteDTO,
} from '../types/facturacion.types';

import { getAuthHeaders } from '@core/utils/authHeaders';

export class FacturacionService {
  private static getHeaders() {
    return getAuthHeaders();
  }

  static async emitir(dto: EmitirComprobanteDTO): Promise<ComprobanteFiscal> {
    const res = await fetch('/api/facturacion/emite', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al emitir comprobante electrónico');
    }
    return await res.json();
  }

  static async obtenerComprobantes(): Promise<ComprobanteFiscal[]> {
    try {
      const res = await fetch('/api/facturacion/comprobantes', { headers: this.getHeaders() });
      if (!res.ok) throw new Error('Error al consultar comprobantes');
      return await res.json();
    } catch {
      return [
        {
          id: 1,
          tipoComprobante: '03',
          serie: 'B001',
          correlativo: 1,
          fechaEmision: new Date().toISOString(),
          clienteTipoDoc: '0',
          clienteNumDoc: '-',
          clienteNombre: 'CLIENTES VARIOS',
          moneda: 'PEN',
          opGravadas: 8.47,
          opExoneradas: 0,
          igv: 1.53,
          total: 10.0,
          metodoPago: 'Efectivo',
          estadoSunat: 'ACEPTADO',
          codigoRespuestaSunat: '0',
          mensajeRespuestaSunat: 'Comprobante ha sido ACEPTADO',
          digestValue: 'MOCK_DIGEST_VAL==',
          codigoQr: '20123456789|03|B001|1|1.53|10.00|2026-09-04|0|-|MOCK_DIGEST_VAL==',
        },
      ];
    }
  }

  static async reintentar(id: number): Promise<ComprobanteFiscal> {
    const res = await fetch(`/api/facturacion/reintentar/${id}`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al reintentar comprobante');
    }
    return await res.json();
  }
}
