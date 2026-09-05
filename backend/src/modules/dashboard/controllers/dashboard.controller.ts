import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service.js';

const dashboardService = new DashboardService();

export class DashboardController {
  static async obtenerStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await dashboardService.obtenerStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener estadísticas del dashboard' });
    }
  }
}
