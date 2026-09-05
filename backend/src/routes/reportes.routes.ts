import { Router } from 'express';
import { ReportesController } from '../modules/reportes/controllers/reportes.controller.js';
import { authMiddleware, requireRole } from '../core/middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('ADMIN', 'CAJERO'));

router.get('/ingresos', ReportesController.obtenerIngresos);
router.get('/vehiculos', ReportesController.obtenerVehiculos);
router.get('/operadores', ReportesController.obtenerOperadores);
router.get('/caja-balance', ReportesController.obtenerCajaBalance);
router.get('/auditoria', ReportesController.obtenerAuditoria);

export default router;
