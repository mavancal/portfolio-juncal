import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Cargar variables de entorno ANTES de cualquier otra importación
dotenv.config();

// Inicializar la conexión a la BD (crea el archivo y el esquema si no existen)
import './db/connection';

import proyectosRouter from './routes/proyectos.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// ── Middlewares globales ──────────────────────────────────────────────────────

// Parsear cuerpo de solicitudes como JSON
app.use(express.json());

// CORS: permite solicitudes solo desde los orígenes configurados en .env
// FRONTEND_ORIGIN puede ser una lista separada por comas (ej: localhost y 127.0.0.1)
const origenesPermitidos = (process.env.FRONTEND_ORIGIN ?? 'http://localhost:5500')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: origenesPermitidos,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
  })
);

// ── Rutas ─────────────────────────────────────────────────────────────────────

// Endpoint de salud: el frontend puede usarlo para verificar que el backend está activo
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// CRUD de proyectos
app.use('/api/proyectos', proyectosRouter);

// ── 404 ───────────────────────────────────────────────────────────────────────

// Cualquier ruta no definida devuelve JSON (no el HTML de Express por defecto)
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ── Manejo de errores ─────────────────────────────────────────────────────────

// Debe ir DESPUÉS de todas las rutas
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

export default app;
