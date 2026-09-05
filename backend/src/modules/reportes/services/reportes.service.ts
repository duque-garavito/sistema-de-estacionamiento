import { ReportesRepository } from '../repositories/reportes.repository.js';
import {
  ReporteIngresosResponse,
  ReporteVehiculosResponse,
  ReporteOperadoresResponse,
  ReporteCajaBalanceResponse,
  RegistroAuditoria,
} from '../types/reportes.types.js';

export class ReportesService {
  private repository = new ReportesRepository();

  async obtenerReporteIngresos(rango?: string, fechaInicio?: string, fechaFin?: string): Promise<ReporteIngresosResponse> {
    return this.repository.obtenerReporteIngresos(rango, fechaInicio, fechaFin);
  }

  async obtenerReporteVehiculos(rango?: string, fechaInicio?: string, fechaFin?: string): Promise<ReporteVehiculosResponse> {
    return this.repository.obtenerReporteVehiculos(rango, fechaInicio, fechaFin);
  }

  async obtenerReporteOperadores(rango?: string, fechaInicio?: string, fechaFin?: string): Promise<ReporteOperadoresResponse[]> {
    return this.repository.obtenerReporteOperadores(rango, fechaInicio, fechaFin);
  }

  async obtenerReporteCajaBalance(rango?: string, fechaInicio?: string, fechaFin?: string): Promise<ReporteCajaBalanceResponse> {
    return this.repository.obtenerReporteCajaBalance(rango, fechaInicio, fechaFin);
  }

  async obtenerAuditoria(rango?: string, fechaInicio?: string, fechaFin?: string): Promise<RegistroAuditoria[]> {
    return this.repository.obtenerAuditoria(rango, fechaInicio, fechaFin);
  }
}
