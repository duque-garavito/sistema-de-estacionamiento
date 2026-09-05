import { Request, Response } from 'express';
import { TarifaService } from '../services/tarifa.service.js';

const tarifaService = new TarifaService();

export class TarifaController {
  static async obtenerTarifas(req: Request, res: Response) {
    try {
      const tarifas = await tarifaService.obtenerTarifas();
      res.json(tarifas);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener tarifas' });
    }
  }

  static async actualizarTarifa(req: Request, res: Response) {
    try {
      const actualizada = await tarifaService.actualizarTarifa(req.body);
      res.json(actualizada);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al actualizar tarifa' });
    }
  }
}
