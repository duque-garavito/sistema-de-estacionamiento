import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/index.js';
import { inicializarTablasDatabase } from './core/config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Logger HTTP para mapeo de peticiones y respuestas
app.use((req, res, next) => {
  const inicio = Date.now();
  res.on('finish', () => {
    const duracion = Date.now() - inicio;
    const emoji = res.statusCode >= 500 ? '❌' : res.statusCode >= 400 ? '⚠️' : '✅';
    console.log(`${emoji} [HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duracion}ms)`);
  });
  next();
});

// API Prefix
app.use('/api', apiRouter);

// Middleware Global de Errores Desconocidos / Excepciones
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(`💥 [ERROR BACKEND CENTRAL] ${req.method} ${req.originalUrl}:`, err.stack || err.message || err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, async () => {
  await inicializarTablasDatabase();
  console.log(`🚀 Servidor Backend corriendo en http://localhost:${PORT}`);
});

export default app;
