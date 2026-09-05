import { FacturacionRepository } from '../repositories/facturacion.repository.js';
import { CpeNumberingService } from './cpe-numbering.service.js';
import { CpeBuilderService } from './cpe-builder.service.js';
import { FiscalProvider } from '../providers/fiscal-provider.interface.js';
import { MockFiscalProvider } from '../providers/mock-fiscal.provider.js';
import { NubefactFiscalProvider } from '../providers/nubefact-fiscal.provider.js';
import {
  EmitirComprobanteDTO,
  ComprobanteFiscalEntity,
  RespuestaFiscalDTO,
} from '../types/facturacion.types.js';

export class FacturacionService {
  private repository = new FacturacionRepository();
  private numberingService = new CpeNumberingService();
  private fiscalProvider: FiscalProvider;

  constructor() {
    // Carga dinámica de proveedor fiscal según variable de entorno
    if (process.env.FISCAL_PROVIDER === 'NUBEFACT') {
      this.fiscalProvider = new NubefactFiscalProvider();
    } else {
      this.fiscalProvider = new MockFiscalProvider();
    }
  }

  // Inyección de proveedor fiscal para permitir cambio dinámico entre Mock, NubeFact o PSE
  setProvider(provider: FiscalProvider) {
    this.fiscalProvider = provider;
  }

  async emitirComprobante(dto: EmitirComprobanteDTO): Promise<ComprobanteFiscalEntity> {
    // Restricción de Alcance Fiscal FASE 10.3: Exclusivamente Boleta Electrónica (03)
    if (dto.tipoComprobante !== '03') {
      throw new Error(`El tipo de comprobante ${dto.tipoComprobante} no está habilitado actualmente. Esta versión admite únicamente Boletas de Venta Electrónicas (03).`);
    }

    // 1. Obtener siguiente correlativo atómico por tipo (03: B001)
    const { serie, correlativo } = await this.numberingService.obtenerSiguienteCorrelativo(dto.tipoComprobante);

    // 2. Construir entidad con impuestos (18% IGV) y estado BORRADOR
    let cpe = CpeBuilderService.construirEntidadComprobante(dto, serie, correlativo);
    cpe = await this.repository.guardar(cpe);

    // 3. Generar y Enviar al proveedor fiscal desacoplado
    try {
      cpe.estadoSunat = 'ENVIADO';
      const resFiscal = await this.fiscalProvider.emitir(cpe);

      if (resFiscal.exito) {
        cpe.estadoSunat = 'ACEPTADO';
        cpe.codigoRespuestaSunat = resFiscal.codigoRespuesta || '0';
        cpe.mensajeRespuestaSunat = resFiscal.mensajeRespuesta;
        cpe.digestValue = resFiscal.digestValue;
        cpe.codigoQr = resFiscal.cadenaQr;
        cpe.xmlPath = resFiscal.xmlMockPath;
        cpe.cdrPath = resFiscal.cdrMockPath;

        await this.repository.actualizarEstado(cpe.id, 'ACEPTADO', {
          codigo: resFiscal.codigoRespuesta,
          mensaje: resFiscal.mensajeRespuesta,
          digest: resFiscal.digestValue,
          qr: resFiscal.cadenaQr,
          xml: resFiscal.xmlMockPath,
          cdr: resFiscal.cdrMockPath,
        });
      } else {
        cpe.estadoSunat = 'RECHAZADO';
        cpe.codigoRespuestaSunat = resFiscal.codigoRespuesta || 'ERR999';
        cpe.mensajeRespuestaSunat = resFiscal.mensajeRespuesta || 'Rechazado por SUNAT';
        await this.repository.actualizarEstado(cpe.id, 'RECHAZADO', {
          codigo: resFiscal.codigoRespuesta,
          mensaje: resFiscal.mensajeRespuesta,
        });
      }
    } catch (error: any) {
      // Manejo de contingencia offline / fallas de red -> Estado PENDIENTE
      cpe.estadoSunat = 'PENDIENTE';
      cpe.mensajeRespuestaSunat = `Modo Contingencia: ${error.message || 'Servicio fiscal temporalmente inaccesible. Reintento programado.'}`;
      await this.repository.actualizarEstado(cpe.id, 'PENDIENTE', {
        mensaje: cpe.mensajeRespuestaSunat,
      });
    }

    return cpe;
  }

  async obtenerComprobantes(): Promise<ComprobanteFiscalEntity[]> {
    return this.repository.obtenerTodos();
  }

  async reintentarEnvio(id: number): Promise<ComprobanteFiscalEntity | null> {
    const todos = await this.repository.obtenerTodos();
    const cpe = todos.find((x) => x.id === id);
    if (!cpe) return null;

    try {
      const resFiscal = await this.fiscalProvider.emitir(cpe);
      if (resFiscal.exito) {
        await this.repository.actualizarEstado(cpe.id, 'ACEPTADO', {
          codigo: resFiscal.codigoRespuesta,
          mensaje: resFiscal.mensajeRespuesta,
          digest: resFiscal.digestValue,
          qr: resFiscal.cadenaQr,
        });
        cpe.estadoSunat = 'ACEPTADO';
      }
    } catch (err: any) {
      // Mantiene PENDIENTE
    }

    return cpe;
  }
}
