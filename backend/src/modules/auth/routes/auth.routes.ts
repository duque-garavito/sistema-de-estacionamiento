import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware, requireRole } from '../../../core/middleware/auth.middleware.js';

const router = Router();

router.post('/login', AuthController.login);

// Rutas de administración de usuarios
router.get('/usuarios', AuthController.listarUsuarios);
router.post('/usuarios', authMiddleware, requireRole('ADMIN'), AuthController.crearUsuario);
router.put('/usuarios/:id', authMiddleware, requireRole('ADMIN'), AuthController.actualizarUsuario);
router.put('/usuarios/:id/password', authMiddleware, requireRole('ADMIN'), AuthController.cambiarPassword);

export default router;
