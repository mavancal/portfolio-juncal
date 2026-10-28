import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Cargar variables de entorno desde .env
dotenv.config();

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

// Los routers de proyectos se montan en la Etapa 4
// app.use('/api/proyectos', proyectosRouter);

// ── 404 ───────────────────────────────────────────────────────────────────────

// Cualquier ruta no definida devuelve JSON (no el HTML de Express por defecto)
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ── Manejo de errores ─────────────────────────────────────────────────────────

// Firma de 4 parámetros obligatoria para que Express lo reconozca como errorHandler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

export default app;
