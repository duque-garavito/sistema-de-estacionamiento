import { Router } from 'express';
import { TarifaController } from '../modules/tarifas/controllers/tarifa.controller.js';
import { authMiddleware, requireRole } from '../core/middleware/auth.middleware.js';

const router = Router();

router.get('/', TarifaController.obtenerTarifas);
router.put('/', authMiddleware, requireRole('ADMIN'), TarifaController.actualizarTarifa);

export default router;
