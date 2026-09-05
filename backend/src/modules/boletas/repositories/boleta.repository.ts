import { dbPool } from '../../../core/config/database.js';
import {
  EmpresaConfig,
  BoletaEntity,
  TipoComprobante,
} from '../types/boleta.types.js';
import { ConfiguracionRepository } from '../../configuracion/repositories/configuracion.repository.js';

export class BoletaRepository {
  private configRepo = new ConfiguracionRepository();
  private static boletasMemoryStore: BoletaEntity[] = [];

  async getEmpresaConfig(): Promise<EmpresaConfig> {
    const config = await this.configRepo.obtenerConfiguracion();
    return {
      id: config.id,
      ruc: config.ruc,
      razonSocial: config.razonSocial,
      nombreComercial: config.nombreComercial,
      direccion: config.direccion,
      telefono: config.telefono,
      serieBoleta: config.serieBoleta,
      correlativoBoleta: config.correlativoBoleta,
      serieFactura: config.serieFactura,
      correlativoFactura: config.correlativoFactura,
      leyendaTicket: config.leyendaTicket,
    };
  }

  async updateEmpresaConfig(dto: Partial<EmpresaConfig>): Promise<EmpresaConfig> {
    const updated = await this.configRepo.actualizarConfiguracion(dto as any);
    return {
      id: updated.id,
      ruc: updated.ruc,
      razonSocial: updated.razonSocial,
      nombreComercial: updated.nombreComercial,
      direccion: updated.direccion,
      telefono: updated.telefono,
      serieBoleta: updated.serieBoleta,
      correlativoBoleta: updated.correlativoBoleta,
      serieFactura: updated.serieFactura,
      correlativoFactura: updated.correlativoFactura,
      leyendaTicket: updated.leyendaTicket,
    };
  }

  async obtenerSiguienteNumero(tipo: TipoComprobante): Promise<{ serie: string; correlativo: number; numeroFormateado: string }> {
    const config = await this.getEmpresaConfig();

    if (tipo === 'BOLETA') {
      const serie = config.serieBoleta || 'B001';
      const correlativo = config.correlativoBoleta || 1;
      const numStr = String(correlativo).padStart(6, '0');

      // Increment correlativo in DB / store
      await this.updateEmpresaConfig({ correlativoBoleta: correlativo + 1 });
      return { serie, correlativo, numeroFormateado: `${serie}-${numStr}` };
    }

    if (tipo === 'FACTURA') {
      const serie = config.serieFactura || 'F001';
      const correlativo = config.correlativoFactura || 1;
      const numStr = String(correlativo).padStart(6, '0');

      await this.updateEmpresaConfig({ correlativoFactura: correlativo + 1 });
      return { serie, correlativo, numeroFormateado: `${serie}-${numStr}` };
    }

    // Default TICKET
    const rand = Math.floor(100000 + Math.random() * 900000);
    return {
      serie: 'T001',
      correlativo: rand,
      numeroFormateado: `TKT-${rand}`,
    };
  }

  async guardarBoleta(boleta: BoletaEntity): Promise<BoletaEntity> {
    try {
      await dbPool.query(
        `INSERT INTO boletas (
          numero_ticket, movimiento_id, tipo_comprobante, serie, correlativo,
          cliente_tipo_doc, cliente_num_doc, cliente_nombre, cliente_direccion,
          subtotal, igv, total, metodo_pago, cajero, fecha_emision
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          boleta.numeroTicket,
          boleta.movimientoId ? Number(boleta.movimientoId) : null,
          boleta.tipoComprobante,
          boleta.serie,
          boleta.correlativo,
          boleta.clienteTipoDoc,
          boleta.clienteNumDoc,
          boleta.clienteNombre,
          boleta.clienteDireccion || null,
          boleta.subtotal,
          boleta.igv,
          boleta.total,
          boleta.metodoPago,
          boleta.cajero,
          boleta.fechaEmision,
        ]
      );
    } catch {
      // Fallback local
    }

    BoletaRepository.boletasMemoryStore.unshift(boleta);
    return boleta;
  }

  async obtenerBoletas(): Promise<BoletaEntity[]> {
    try {
      const [rows]: any = await dbPool.query('SELECT * FROM boletas ORDER BY fecha_emision DESC');
      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map((r: any) => ({
          id: String(r.id),
          numeroTicket: r.numero_ticket,
          movimientoId: r.movimiento_id ? String(r.movimiento_id) : null,
          cajaId: r.caja_id ? Number(r.caja_id) : null,
          tipoComprobante: r.tipo_comprobante,
          serie: r.serie,
          correlativo: Number(r.correlativo),
          clienteTipoDoc: r.cliente_tipo_doc,
          clienteNumDoc: r.cliente_num_doc,
          clienteNombre: r.cliente_nombre,
          clienteDireccion: r.cliente_direccion || '',
          placa: 'ABC-123',
          tipoVehiculo: 'Auto',
          fechaIngreso: new Date(r.fecha_emision).toISOString(),
          fechaSalida: new Date(r.fecha_emision).toISOString(),
          tiempoTotalFormatted: '1 hora(s)',
          subtotal: Number(r.subtotal),
          igv: Number(r.igv),
          total: Number(r.total),
          metodoPago: r.metodo_pago,
          cajero: r.cajero,
          fechaEmision: new Date(r.fecha_emision).toISOString(),
        }));
      }
    } catch {
      // Fallback local
    }
    return BoletaRepository.boletasMemoryStore;
  }
}
