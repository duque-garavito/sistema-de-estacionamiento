import { Router } from 'express';
import { ListaNegraController } from '../controllers/lista-negra.controller.js';
import { authMiddleware, requireRole } from '../../../core/middleware/auth.middleware.js';

const router = Router();

router.get('/', ListaNegraController.obtenerLista);
router.get('/verificar/:placa', ListaNegraController.verificarPlaca);
router.post('/', authMiddleware, requireRole('ADMIN'), ListaNegraController.agregar);
router.delete('/:placa', authMiddleware, requireRole('ADMIN'), ListaNegraController.retirar);

export default router;

