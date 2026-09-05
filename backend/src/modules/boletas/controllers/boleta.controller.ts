import { Request, Response } from 'express';
import { BoletaService } from '../services/boleta.service.js';

const boletaService = new BoletaService();

export class BoletaController {
  async getEmpresaConfig(req: Request, res: Response): Promise<void> {
    try {
      const config = await boletaService.getEmpresaConfig();
      res.json({ success: true, data: config });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateEmpresaConfig(req: Request, res: Response): Promise<void> {
    try {
      const config = await boletaService.updateEmpresaConfig(req.body);
      res.json({ success: true, data: config, message: 'Configuración actualizada exitosamente' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async emitirComprobante(req: Request, res: Response): Promise<void> {
    try {
      const { placa, tipoVehiculo, fechaIngreso, fechaSalida, total, metodoPago } = req.body;
      if (!placa || !tipoVehiculo || !fechaIngreso || !fechaSalida || total === undefined || !metodoPago) {
        res.status(400).json({ success: false, message: 'Campos obligatorios incompletos' });
        return;
      }

      const boleta = await boletaService.emitirComprobante(req.body);
      res.status(201).json({ success: true, data: boleta });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async obtenerBoletas(req: Request, res: Response): Promise<void> {
    try {
      const boletas = await boletaService.obtenerBoletas();
      res.json({ success: true, data: boletas });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
