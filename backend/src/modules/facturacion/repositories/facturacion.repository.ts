import { dbPool } from '../../../core/config/database.js';
import { ComprobanteFiscalEntity, EstadoSunat } from '../types/facturacion.types.js';

export class FacturacionRepository {
  private static memoryStore: ComprobanteFiscalEntity[] = [];

  async guardar(cpe: ComprobanteFiscalEntity): Promise<ComprobanteFiscalEntity> {
    try {
      const [res]: any = await dbPool.query(
        `INSERT INTO comprobantes_electronicos (
          movimiento_id, tipo_comprobante, serie, correlativo, fecha_emision, fecha_envio, fecha_respuesta,
          cliente_tipo_doc, cliente_num_doc, cliente_nombre, cliente_direccion, moneda,
          op_gravadas, op_exoneradas, igv, total, metodo_pago, estado_sunat,
          codigo_respuesta_sunat, mensaje_respuesta_sunat, digest_value, codigo_qr, xml_path, cdr_path, usuario_id
        ) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cpe.movimientoId || null,
          cpe.tipoComprobante,
          cpe.serie,
          cpe.correlativo,
          cpe.fechaEnvio || null,
          cpe.fechaRespuesta || null,
          cpe.clienteTipoDoc,
          cpe.clienteNumDoc,
          cpe.clienteNombre,
          cpe.clienteDireccion || null,
          cpe.moneda || 'PEN',
          cpe.opGravadas,
          cpe.opExoneradas,
          cpe.igv,
          cpe.total,
          cpe.metodoPago,
          cpe.estadoSunat,
          cpe.codigoRespuestaSunat || null,
          cpe.mensajeRespuestaSunat || null,
          cpe.digestValue || null,
          cpe.codigoQr || null,
          cpe.xmlPath || null,
          cpe.cdrPath || null,
          cpe.usuarioId || 1,
        ]
      );
      cpe.id = res.insertId || Date.now();
    } catch {
      cpe.id = Date.now();
    }

    FacturacionRepository.memoryStore.unshift(cpe);
    await this.registrarAuditoria(cpe.id, 'N/A', cpe.estadoSunat, cpe.usuarioId, `Creación comprobante ${cpe.serie}-${cpe.correlativo}`);
    return cpe;
  }

  async actualizarEstado(
    id: number,
    nuevoEstado: EstadoSunat,
    resfiscal?: { codigo?: string; mensaje?: string; digest?: string; qr?: string; xml?: string; cdr?: string }
  ): Promise<boolean> {
    const actual = FacturacionRepository.memoryStore.find((x) => x.id === id);
    const estadoAnterior = actual ? actual.estadoSunat : 'BORRADOR';

    try {
      await dbPool.query(
        `UPDATE comprobantes_electronicos SET
          estado_sunat = ?, fecha_respuesta = NOW(),
          codigo_respuesta_sunat = COALESCE(?, codigo_respuesta_sunat),
          mensaje_respuesta_sunat = COALESCE(?, mensaje_respuesta_sunat),
          digest_value = COALESCE(?, digest_value),
          codigo_qr = COALESCE(?, codigo_qr),
          xml_path = COALESCE(?, xml_path),
          cdr_path = COALESCE(?, cdr_path)
        WHERE id = ?`,
        [
          nuevoEstado,
          resfiscal?.codigo || null,
          resfiscal?.mensaje || null,
          resfiscal?.digest || null,
          resfiscal?.qr || null,
          resfiscal?.xml || null,
          resfiscal?.cdr || null,
          id,
        ]
      );
    } catch {
      // Memory fallback
    }

    if (actual) {
      actual.estadoSunat = nuevoEstado;
      if (resfiscal?.codigo) actual.codigoRespuestaSunat = resfiscal.codigo;
      if (resfiscal?.mensaje) actual.mensajeRespuestaSunat = resfiscal.mensaje;
      if (resfiscal?.digest) actual.digestValue = resfiscal.digest;
      if (resfiscal?.qr) actual.codigoQr = resfiscal.qr;
    }

    await this.registrarAuditoria(id, estadoAnterior, nuevoEstado, 1, resfiscal?.mensaje || 'Actualización estado CPE');
    return true;
  }

  async obtenerTodos(): Promise<ComprobanteFiscalEntity[]> {
    try {
      const [rows]: any = await dbPool.query('SELECT * FROM comprobantes_electronicos ORDER BY id DESC');
      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map((r: any) => ({
          id: r.id,
          movimientoId: r.movimiento_id,
          tipoComprobante: r.tipo_comprobante,
          serie: r.serie,
          correlativo: r.correlativo,
          fechaEmision: r.fecha_emision,
          fechaEnvio: r.fecha_envio,
          fechaRespuesta: r.fecha_respuesta,
          clienteTipoDoc: r.cliente_tipo_doc,
          clienteNumDoc: r.cliente_num_doc,
          clienteNombre: r.cliente_nombre,
          clienteDireccion: r.cliente_direccion,
          moneda: r.moneda,
          opGravadas: Number(r.op_gravadas),
          opExoneradas: Number(r.op_exoneradas),
          igv: Number(r.igv),
          total: Number(r.total),
          metodoPago: r.metodo_pago,
          estadoSunat: r.estado_sunat,
          codigoRespuestaSunat: r.codigo_respuesta_sunat,
          mensajeRespuestaSunat: r.mensaje_respuesta_sunat,
          digestValue: r.digest_value,
          codigoQr: r.codigo_qr,
          xmlPath: r.xml_path,
          cdrPath: r.cdr_path,
          usuarioId: r.usuario_id,
        }));
      }
    } catch {
      // Fallback
    }
    return FacturacionRepository.memoryStore;
  }

  async registrarAuditoria(comprobanteId: number, estadoAnterior: string, estadoNuevo: string, usuarioId: number, observacion: string) {
    try {
      await dbPool.query(
        'INSERT INTO comprobantes_auditoria (comprobante_id, estado_anterior, estado_nuevo, usuario_id, observacion, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [comprobanteId, estadoAnterior, estadoNuevo, usuarioId, observacion]
      );
    } catch {
      // Ignorar fallback
    }
  }
}
