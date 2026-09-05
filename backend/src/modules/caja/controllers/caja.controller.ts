import { Request, Response } from 'express';
import { CajaService } from '../services/caja.service.js';

const cajaService = new CajaService();

export class CajaController {
  static async obtenerResumen(req: Request, res: Response) {
    try {
      const fecha = (req.query.fecha as string) || new Date().toISOString().split('T')[0];
      const resumen = await cajaService.obtenerResumenCaja(fecha);
      res.json(resumen);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener resumen de caja' });
    }
  }

  static async registrarGasto(req: Request, res: Response) {
    try {
      const nuevo = await cajaService.registrarGasto(req.body);
      res.status(201).json(nuevo);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Error al registrar gasto' });
    }
  }

  static async obtenerGastos(req: Request, res: Response) {
    try {
      const fecha = (req.query.fecha as string) || new Date().toISOString().split('T')[0];
      const gastos = await cajaService.obtenerGastos(fecha);
      res.json(gastos);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener gastos' });
    }
  }

  static async obtenerRecaudadores(req: Request, res: Response) {
    try {
      const fecha = (req.query.fecha as string) || new Date().toISOString().split('T')[0];
      const recaudadores = await cajaService.obtenerRecaudadores(fecha);
      res.json(recaudadores);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener recaudadores' });
    }
  }

  static async obtenerDetalle(req: Request, res: Response) {
    try {
      const fecha = (req.query.fecha as string) || new Date().toISOString().split('T')[0];
      const detalle = await cajaService.obtenerDetalleDiario(fecha);
      res.json(detalle);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener detalle diario de caja' });
    }
  }

  static async obtenerHistorial(req: Request, res: Response) {
    try {
      const dias = parseInt(req.query.dias as string, 10) || 30;
      const historial = await cajaService.obtenerHistorial30Dias(dias);
      res.json(historial);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al obtener historial de caja' });
    }
  }
}
