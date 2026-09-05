import { EmitirComprobanteDTO, ComprobanteFiscalEntity } from '../types/facturacion.types.js';

export class CpeBuilderService {
  static calcularImpuestos(total: number): { opGravadas: number; igv: number } {
    // IGV en Perú: Total incluye 18% IGV.
    // opGravadas = Total / 1.18
    // igv = Total - opGravadas
    const totalVal = Math.max(0, total);
    const opGravadas = parseFloat((totalVal / 1.18).toFixed(2));
    const igv = parseFloat((totalVal - opGravadas).toFixed(2));
    return { opGravadas, igv };
  }

  static validarCliente(dto: EmitirComprobanteDTO): void {
    if (dto.tipoComprobante === '01') {
      // FACTURA
      if (dto.clienteTipoDoc !== '6') {
        throw new Error('Para Factura (01), el tipo de documento del cliente debe ser RUC (6).');
      }
      if (!dto.clienteNumDoc || !/^\d{11}$/.test(dto.clienteNumDoc)) {
        throw new Error('Para Factura (01), el RUC del cliente debe tener exactamente 11 dígitos numéricos.');
      }
      if (!dto.clienteNombre || dto.clienteNombre.trim().toUpperCase() === 'CLIENTES VARIOS') {
        throw new Error('Para Factura (01), la Razón Social del cliente es obligatoria.');
      }
    } else if (dto.tipoComprobante === '03') {
      // BOLETA
      if (dto.total >= 700) {
        if (!dto.clienteNumDoc || dto.clienteNumDoc === '-') {
          throw new Error('Para Boletas superiores a S/ 700.00, es obligatorio identificar al cliente (DNI / RUC).');
        }
      }
      if (dto.clienteTipoDoc === '1' && dto.clienteNumDoc && dto.clienteNumDoc !== '-') {
        if (!/^\d{8}$/.test(dto.clienteNumDoc)) {
          throw new Error('El DNI del cliente debe tener exactamente 8 dígitos numéricos.');
        }
      }
    }
  }

  static construirEntidadComprobante(
    dto: EmitirComprobanteDTO,
    serie: string,
    correlativo: number
  ): ComprobanteFiscalEntity {
    this.validarCliente(dto);
    const { opGravadas, igv } = this.calcularImpuestos(dto.total);

    return {
      id: 0,
      movimientoId: dto.movimientoId || null,
      tipoComprobante: dto.tipoComprobante,
      serie,
      correlativo,
      fechaEmision: new Date().toISOString(),
      clienteTipoDoc: dto.clienteTipoDoc,
      clienteNumDoc: dto.clienteNumDoc || '-',
      clienteNombre: dto.clienteNombre || 'CLIENTES VARIOS',
      clienteDireccion: dto.clienteDireccion || null,
      moneda: 'PEN',
      opGravadas,
      opExoneradas: 0.00,
      igv,
      total: dto.total,
      metodoPago: dto.metodoPago || 'Efectivo',
      estadoSunat: 'BORRADOR',
      usuarioId: dto.usuarioId || 1,
    };
  }
}
