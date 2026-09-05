import { Request, Response } from 'express';
import { ReportesService } from '../services/reportes.service.js';

const reportesService = new ReportesService();

export class ReportesController {
  static async obtenerIngresos(req: Request, res: Response) {
    try {
      const { rango, fechaInicio, fechaFin } = req.query as any;
      const data = await reportesService.obtenerReporteIngresos(rango, fechaInicio, fechaFin);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener reporte de ingresos' });
    }
  }

  static async obtenerVehiculos(req: Request, res: Response) {
    try {
      const { rango, fechaInicio, fechaFin } = req.query as any;
      const data = await reportesService.obtenerReporteVehiculos(rango, fechaInicio, fechaFin);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener reporte de vehículos' });
    }
  }

  static async obtenerOperadores(req: Request, res: Response) {
    try {
      const { rango, fechaInicio, fechaFin } = req.query as any;
      const data = await reportesService.obtenerReporteOperadores(rango, fechaInicio, fechaFin);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener reporte de operadores' });
    }
  }

  static async obtenerCajaBalance(req: Request, res: Response) {
    try {
      const { rango, fechaInicio, fechaFin } = req.query as any;
      const data = await reportesService.obtenerReporteCajaBalance(rango, fechaInicio, fechaFin);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener reporte de caja y balance' });
    }
  }

  static async obtenerAuditoria(req: Request, res: Response) {
    try {
      const { rango, fechaInicio, fechaFin } = req.query as any;
      const data = await reportesService.obtenerAuditoria(rango, fechaInicio, fechaFin);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener auditoría de operaciones' });
    }
  }
}
