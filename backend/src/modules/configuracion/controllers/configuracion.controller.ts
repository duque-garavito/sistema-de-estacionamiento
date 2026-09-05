import { Request, Response } from 'express';
import { ConfiguracionRepository } from '../repositories/configuracion.repository.js';

const repository = new ConfiguracionRepository();

export class ConfiguracionController {
  static async obtenerConfig(req: Request, res: Response) {
    try {
      const config = await repository.obtenerConfiguracion();
      res.json(config);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error al obtener configuración' });
    }
  }

  static async actualizarConfig(req: Request, res: Response) {
    try {
      const config = await repository.actualizarConfiguracion(req.body);
      res.json(config);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error al actualizar configuración' });
    }
  }
}
