import { Router } from 'express';
import { BoletaController } from '../modules/boletas/controllers/boleta.controller.js';
import { authMiddleware, requireRole } from '../core/middleware/auth.middleware.js';

const router = Router();
const controller = new BoletaController();

router.get('/empresa', (req, res) => controller.getEmpresaConfig(req, res));
router.put('/empresa', authMiddleware, requireRole('ADMIN'), (req, res) => controller.updateEmpresaConfig(req, res));
router.post('/emitir', (req, res) => controller.emitirComprobante(req, res));
router.get('/', (req, res) => controller.obtenerBoletas(req, res));

export default router;
