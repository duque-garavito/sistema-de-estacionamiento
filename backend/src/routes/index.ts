import { Router } from 'express';
import authRoutes from './auth.routes.js';
import movimientosRoutes from './movimientos.routes.js';
import tarifasRoutes from './tarifas.routes.js';
import listaNegraRoutes from './lista-negra.routes.js';
import cajaRoutes from './caja.routes.js';
import boletasRoutes from './boletas.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import reportesRoutes from './reportes.routes.js';
import configuracionRoutes from './configuracion.routes.js';
import facturacionRoutes from './facturacion.routes.js';

const apiRouter = Router();

// Health Check
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Centralized API Routes (Rutas -> Controllers -> Repositories)
apiRouter.use('/auth', authRoutes);
apiRouter.use('/movimientos', movimientosRoutes);
apiRouter.use('/tarifas', tarifasRoutes);
apiRouter.use('/lista-negra', listaNegraRoutes);
apiRouter.use('/caja', cajaRoutes);
apiRouter.use('/boletas', boletasRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/reportes', reportesRoutes);
apiRouter.use('/configuracion', configuracionRoutes);
apiRouter.use('/facturacion', facturacionRoutes);

export default apiRouter;
