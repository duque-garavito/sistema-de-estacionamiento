import { Request, Response } from 'express';
import { MovimientoService } from '../services/movimiento.service.js';

const movimientoService = new MovimientoService();

export class MovimientosController {
  static async obtenerActivos(req: Request, res: Response) {
    try {
      const activos = await movimientoService.obtenerMovimientosActivos();
      res.json(activos);
    } catch (error: any) {
      console.error('❌ [MOVIMIENTOS ACTIVOS ERROR]:', error.message || error);
      res.status(500).json({ error: error.message || 'Error al obtener movimientos activos' });
    }
  }

  static async registrarEntrada(req: Request, res: Response) {
    try {
      const nuevo = await movimientoService.registrarIngresoVehiculo(req.body);
      console.log(`🚗 [INGRESO REGISTRADO] Placa: ${nuevo.placa} | Ticket: ${nuevo.codigoTicket}`);
      res.status(201).json(nuevo);
    } catch (error: any) {
      console.error('❌ [REGISTRAR ENTRADA ERROR]:', error.message || error);
      res.status(400).json({ error: error.message || 'Error al registrar entrada' });
    }
  }

  static async registrarSalida(req: Request, res: Response) {
    try {
      const salida = await movimientoService.registrarSalidaVehiculo(req.body);
      console.log(`🏁 [SALIDA REGISTRADA] Placa: ${salida.placa} | Total: S/ ${salida.totalPagar}`);
      res.json(salida);
    } catch (error: any) {
      console.error('❌ [REGISTRAR SALIDA ERROR]:', error.message || error);
      res.status(400).json({ error: error.message || 'Error al registrar salida' });
    }
  }

  static async obtenerHistorial(req: Request, res: Response) {
    try {
      const placa = req.query.placa as string | undefined;
      const historial = await movimientoService.obtenerHistorialMovimientos(placa);
      res.json(historial);
    } catch (error: any) {
      console.error('❌ [MOVIMIENTOS HISTORIAL ERROR]:', error.message || error);
      res.status(500).json({ error: error.message || 'Error al obtener historial de movimientos' });
    }
  }

  static async obtenerPorId(req: Request, res: Response) {
    try {
      const mov = await movimientoService.obtenerMovimientoPorId(req.params.id);
      res.json(mov);
    } catch (error: any) {
      console.error(`❌ [MOVIMIENTO ID ERROR] ID: ${req.params.id}:`, error.message || error);
      res.status(404).json({ error: error.message || 'Movimiento no encontrado' });
    }
  }

  static async actualizarInfo(req: Request, res: Response) {
    try {
      const actualizado = await movimientoService.actualizarInfoMovimiento(req.params.id, req.body);
      console.log(`✏️ [MOVIMIENTO ACTUALIZADO] ID: ${req.params.id}`);
      res.json(actualizado);
    } catch (error: any) {
      console.error(`❌ [ACTUALIZAR MOVIMIENTO ERROR] ID: ${req.params.id}:`, error.message || error);
      res.status(400).json({ error: error.message || 'Error al actualizar información del movimiento' });
    }
  }

  static async obtenerTicketEntrada(req: Request, res: Response) {
    try {
      const ticket = await movimientoService.obtenerTicketEntradaData(req.params.id);
      res.json({ success: true, data: ticket });
    } catch (error: any) {
      console.error(`❌ [TICKET ENTRADA ERROR] ID: ${req.params.id}:`, error.message || error);
      res.status(404).json({ success: false, message: error.message });
    }
  }

  static async obtenerTicketSalida(req: Request, res: Response) {
    try {
      const ticket = await movimientoService.obtenerTicketSalidaData(req.params.id);
      res.json({ success: true, data: ticket });
    } catch (error: any) {
      console.error(`❌ [TICKET SALIDA ERROR] ID: ${req.params.id}:`, error.message || error);
      res.status(404).json({ success: false, message: error.message });
    }
  }
}
