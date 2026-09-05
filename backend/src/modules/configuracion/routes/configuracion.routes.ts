import { Router } from 'express';
import { ConfiguracionController } from '../controllers/configuracion.controller.js';
import { authMiddleware, requireRole } from '../../../core/middleware/auth.middleware.js';

const router = Router();

router.get('/', ConfiguracionController.obtenerConfig);
router.put('/', authMiddleware, requireRole('ADMIN'), ConfiguracionController.actualizarConfig);

export default router;
