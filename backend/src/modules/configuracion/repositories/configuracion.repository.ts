import { dbPool } from '../../../core/config/database.js';
import { EmpresaConfigEntity, ActualizarConfigDTO } from '../types/configuracion.types.js';

export class ConfiguracionRepository {
  private static memoryStore: EmpresaConfigEntity = {
    id: 1,
    ruc: '20123456789',
    razonSocial: 'ESTACIONAMIENTO COCHERA CENTRAL S.A.C.',
    nombreComercial: 'Cochera Central',
    direccion: 'Av. Principal 123, Miraflores, Lima',
    telefono: '(01) 456-7890',
    serieBoleta: 'B001',
    correlativoBoleta: 1,
    serieFactura: 'F001',
    correlativoFactura: 1,
    leyendaTicket: '¡Gracias por su preferencia! Conserve este ticket para retirar su vehículo.',
    capacidadTotal: 50,
    formatoTicket: '80mm',
    toleranciaMinutos: 10,
  };

  static getMemoryStore(): EmpresaConfigEntity {
    return ConfiguracionRepository.memoryStore;
  }

  static setMemoryStore(data: EmpresaConfigEntity): void {
    ConfiguracionRepository.memoryStore = data;
  }

  async obtenerConfiguracion(): Promise<EmpresaConfigEntity> {
    try {
      const [rows]: any = await dbPool.query('SELECT * FROM empresa_config WHERE id = 1');
      if (Array.isArray(rows) && rows.length > 0) {
        const r = rows[0];
        ConfiguracionRepository.memoryStore = {
          id: 1,
          ruc: r.ruc || ConfiguracionRepository.memoryStore.ruc,
          razonSocial: r.razon_social || ConfiguracionRepository.memoryStore.razonSocial,
          nombreComercial: r.nombre_comercial || ConfiguracionRepository.memoryStore.nombreComercial,
          direccion: r.direccion || ConfiguracionRepository.memoryStore.direccion,
          telefono: r.telefono || ConfiguracionRepository.memoryStore.telefono,
          serieBoleta: r.serie_boleta || ConfiguracionRepository.memoryStore.serieBoleta,
          correlativoBoleta: Number(r.correlativo_boleta || 1),
          serieFactura: r.serie_factura || ConfiguracionRepository.memoryStore.serieFactura,
          correlativoFactura: Number(r.correlativo_factura || 1),
          leyendaTicket: r.leyenda_ticket || ConfiguracionRepository.memoryStore.leyendaTicket,
          capacidadTotal: r.capacidad_total || ConfiguracionRepository.memoryStore.capacidadTotal,
          formatoTicket: r.formato_ticket || ConfiguracionRepository.memoryStore.formatoTicket,
          toleranciaMinutos: r.tolerancia_minutos || ConfiguracionRepository.memoryStore.toleranciaMinutos,
        };
      }
    } catch {
      // Memory store fallback
    }
    return ConfiguracionRepository.memoryStore;
  }

  async actualizarConfiguracion(dto: ActualizarConfigDTO): Promise<EmpresaConfigEntity> {
    const actual = await this.obtenerConfiguracion();
    const nueva: EmpresaConfigEntity = {
      ...actual,
      ...dto,
    };

    try {
      await dbPool.query(
        `INSERT INTO empresa_config (id, ruc, razon_social, nombre_comercial, direccion, telefono, serie_boleta, correlativo_boleta, serie_factura, correlativo_factura, leyenda_ticket)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           ruc = VALUES(ruc),
           razon_social = VALUES(razon_social),
           nombre_comercial = VALUES(nombre_comercial),
           direccion = VALUES(direccion),
           telefono = VALUES(telefono),
           serie_boleta = VALUES(serie_boleta),
           correlativo_boleta = VALUES(correlativo_boleta),
           serie_factura = VALUES(serie_factura),
           correlativo_factura = VALUES(correlativo_factura),
           leyenda_ticket = VALUES(leyenda_ticket)`,
        [
          nueva.ruc,
          nueva.razonSocial,
          nueva.nombreComercial,
          nueva.direccion,
          nueva.telefono,
          nueva.serieBoleta,
          nueva.correlativoBoleta,
          nueva.serieFactura,
          nueva.correlativoFactura,
          nueva.leyendaTicket,
        ]
      );
    } catch {
      // Memory store fallback
    }

    ConfiguracionRepository.memoryStore = nueva;
    return nueva;
  }
}

