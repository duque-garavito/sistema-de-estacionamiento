import { dbPool } from '../../../core/config/database.js';
import { TipoComprobanteFiscal } from '../types/facturacion.types.js';

export class CpeNumberingService {
  private static localCorrelativos: Map<string, number> = new Map([
    ['01:F001', 1],
    ['03:B001', 1],
    ['07:FC01', 1],
    ['07:BC01', 1],
  ]);

  async obtenerSiguienteCorrelativo(tipoComprobante: TipoComprobanteFiscal): Promise<{ serie: string; correlativo: number }> {
    const serie = tipoComprobante === '01' ? 'F001' : (tipoComprobante === '03' ? 'B001' : (tipoComprobante === '07' ? 'FC01' : 'BC01'));
    const key = `${tipoComprobante}:${serie}`;

    try {
      // Intento transaccional con MySQL
      const [rows]: any = await dbPool.query(
        'SELECT correlativo_actual FROM comprobantes_series WHERE tipo_comprobante = ? AND serie = ? FOR UPDATE',
        [tipoComprobante, serie]
      );

      if (Array.isArray(rows) && rows.length > 0) {
        const siguiente = Number(rows[0].correlativo_actual || 0) + 1;
        await dbPool.query(
          'UPDATE comprobantes_series SET correlativo_actual = ? WHERE tipo_comprobante = ? AND serie = ?',
          [siguiente, tipoComprobante, serie]
        );
        return { serie, correlativo: siguiente };
      } else {
        // Insertar serie inicial
        await dbPool.query(
          'INSERT INTO comprobantes_series (tipo_comprobante, serie, correlativo_actual, activo) VALUES (?, ?, 1, 1)',
          [tipoComprobante, serie]
        );
        return { serie, correlativo: 1 };
      }
    } catch {
      // Memory fallback
    }

    const actual = CpeNumberingService.localCorrelativos.get(key) || 1;
    const siguiente = actual;
    CpeNumberingService.localCorrelativos.set(key, actual + 1);
    return { serie, correlativo: siguiente };
  }
}
