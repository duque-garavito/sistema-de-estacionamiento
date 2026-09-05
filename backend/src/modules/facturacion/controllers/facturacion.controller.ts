import { Request, Response } from 'express';
import { FacturacionService } from '../services/facturacion.service.js';

const facturacionService = new FacturacionService();

export class FacturacionController {
  static async emitir(req: Request, res: Response) {
    try {
      const { tipoComprobante, clienteTipoDoc, clienteNumDoc, clienteNombre, total } = req.body;
      if (!tipoComprobante || !clienteTipoDoc || !total) {
        return res.status(400).json({ error: 'Tipo de comprobante, tipo de documento y total son obligatorios.' });
      }

      const cpe = await facturacionService.emitirComprobante(req.body);
      res.status(201).json(cpe);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error al emitir comprobante electrónico' });
    }
  }

  static async listar(req: Request, res: Response) {
    try {
      const lista = await facturacionService.obtenerComprobantes();
      res.json(lista);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error al listar comprobantes' });
    }
  }

  static async reintentar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const cpe = await facturacionService.reintentarEnvio(id);
      if (!cpe) return res.status(404).json({ error: 'Comprobante no encontrado' });
      res.json(cpe);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error al reintentar comprobante' });
    }
  }
}
