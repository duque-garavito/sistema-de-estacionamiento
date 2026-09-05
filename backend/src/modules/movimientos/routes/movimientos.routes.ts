import { Router } from 'express';
import { MovimientosController } from '../controllers/movimientos.controller.js';

const router = Router();

router.get('/activos', MovimientosController.obtenerActivos);
router.get('/historial', MovimientosController.obtenerHistorial);
router.post('/entrada', MovimientosController.registrarEntrada);
router.post('/salida', MovimientosController.registrarSalida);
router.get('/:id/ticket-entrada', MovimientosController.obtenerTicketEntrada);
router.get('/:id/ticket-salida', MovimientosController.obtenerTicketSalida);
router.get('/:id', MovimientosController.obtenerPorId);
router.put('/:id', MovimientosController.actualizarInfo);

export default router;

