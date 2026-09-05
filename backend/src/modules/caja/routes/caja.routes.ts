import { Router } from 'express';
import { CajaController } from '../controllers/caja.controller.js';
import { authMiddleware, requireRole } from '../../../core/middleware/auth.middleware.js';

const router = Router();

router.get('/resumen', CajaController.obtenerResumen);
router.post('/gastos', authMiddleware, requireRole('ADMIN', 'CAJERO'), CajaController.registrarGasto);
router.get('/gastos', CajaController.obtenerGastos);
router.get('/recaudadores', CajaController.obtenerRecaudadores);
router.get('/detalle', CajaController.obtenerDetalle);
router.get('/historial', CajaController.obtenerHistorial);

export default router;

