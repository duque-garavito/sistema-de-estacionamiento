import { BoletaRepository } from '../repositories/boleta.repository.js';
import {
  EmitirBoletaDTO,
  BoletaEntity,
  EmpresaConfig,
  TipoComprobante,
} from '../types/boleta.types.js';

export class BoletaService {
  private repository = new BoletaRepository();

  async getEmpresaConfig(): Promise<EmpresaConfig> {
    return this.repository.getEmpresaConfig();
  }

  async updateEmpresaConfig(dto: Partial<EmpresaConfig>): Promise<EmpresaConfig> {
    return this.repository.updateEmpresaConfig(dto);
  }

  async emitirComprobante(dto: EmitirBoletaDTO): Promise<BoletaEntity> {
    const tipo: TipoComprobante = dto.tipoComprobante || 'TICKET';
    const { serie, correlativo, numeroFormateado } = await this.repository.obtenerSiguienteNumero(tipo);

    // Calcular duración del parqueo
    const ingresoTime = new Date(dto.fechaIngreso).getTime();
    const salidaTime = new Date(dto.fechaSalida).getTime();
    const diffMs = Math.max(0, salidaTime - ingresoTime);
    const minsTotales = Math.floor(diffMs / (1000 * 60));
    const horas = Math.floor(minsTotales / 60);
    const mins = minsTotales % 60;
    const tiempoTotalFormatted = `${horas}h ${mins}m`;

    // Desglose fiscal de IGV (18% incluido)
    const subtotal = parseFloat((dto.total / 1.18).toFixed(2));
    const igv = parseFloat((dto.total - subtotal).toFixed(2));

    const boleta: BoletaEntity = {
      id: `BOL-${Date.now()}`,
      numeroTicket: numeroFormateado,
      movimientoId: dto.movimientoId || null,
      tipoComprobante: tipo,
      serie,
      correlativo,
      clienteTipoDoc: dto.clienteTipoDoc || (tipo === 'FACTURA' ? 'RUC' : tipo === 'BOLETA' ? 'DNI' : 'VARIOS'),
      clienteNumDoc: dto.clienteNumDoc || '-',
      clienteNombre: dto.clienteNombre || (tipo === 'FACTURA' ? 'RAZON SOCIAL S.A.C.' : 'CLIENTE VARIOS'),
      clienteDireccion: dto.clienteDireccion || '',
      placa: dto.placa.toUpperCase(),
      tipoVehiculo: dto.tipoVehiculo,
      fechaIngreso: dto.fechaIngreso,
      fechaSalida: dto.fechaSalida,
      tiempoTotalFormatted,
      subtotal,
      igv,
      total: parseFloat(dto.total.toFixed(2)),
      metodoPago: dto.metodoPago,
      cajero: dto.cajero || 'Operador Caja #1',
      fechaEmision: new Date().toISOString(),
    };

    return this.repository.guardarBoleta(boleta);
  }

  async obtenerBoletas(): Promise<BoletaEntity[]> {
    return this.repository.obtenerBoletas();
  }
}
