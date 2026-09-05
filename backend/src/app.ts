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

// API Prefix
app.use('/api', apiRouter);

app.listen(PORT, async () => {
  await inicializarTablasDatabase();
  console.log(`🚀 Servidor Backend corriendo en http://localhost:${PORT}`);
});

export default app;
