import { Router } from 'express';
import movimientosRoutes from '../modules/movimientos/routes/movimientos.routes.js';
import authRoutes from '../modules/auth/routes/auth.routes.js';
import tarifaRoutes from '../modules/tarifas/routes/tarifa.routes.js';
import listaNegraRoutes from '../modules/lista-negra/routes/lista-negra.routes.js';
import cajaRoutes from '../modules/caja/routes/caja.routes.js';
import boletaRoutes from '../modules/boletas/routes/boleta.routes.js';
import dashboardRoutes from '../modules/dashboard/routes/dashboard.routes.js';
import reportesRoutes from '../modules/reportes/routes/reportes.routes.js';
import configuracionRoutes from '../modules/configuracion/routes/configuracion.routes.js';
import facturacionRoutes from '../modules/facturacion/routes/facturacion.routes.js';

const apiRouter = Router();

// Health Check
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Modular Routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/tarifas', tarifaRoutes);
apiRouter.use('/lista-negra', listaNegraRoutes);
apiRouter.use('/caja', cajaRoutes);
apiRouter.use('/movimientos', movimientosRoutes);
apiRouter.use('/boletas', boletaRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/reportes', reportesRoutes);
apiRouter.use('/configuracion', configuracionRoutes);
apiRouter.use('/facturacion', facturacionRoutes);

export default apiRouter;

