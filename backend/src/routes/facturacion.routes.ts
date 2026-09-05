import { Router } from 'express';
import { FacturacionController } from '../modules/facturacion/controllers/facturacion.controller.js';
import { authMiddleware, requireRole } from '../core/middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/emite', requireRole('ADMIN', 'CAJERO', 'OPERADOR'), FacturacionController.emitir);
router.get('/comprobantes', requireRole('ADMIN', 'CAJERO'), FacturacionController.listar);
router.post('/reintentar/:id', requireRole('ADMIN', 'CAJERO'), FacturacionController.reintentar);

export default router;
