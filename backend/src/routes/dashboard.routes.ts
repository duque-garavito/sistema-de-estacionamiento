import { Router } from 'express';
import { DashboardController } from '../modules/dashboard/controllers/dashboard.controller.js';

const router = Router();

router.get('/stats', DashboardController.obtenerStats);

export default router;
