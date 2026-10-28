/**
 * routes/proyectos.routes.ts
 * Define los 5 endpoints del CRUD de proyectos.
 *
 * GET    /api/proyectos          → lista todos (filtro ?estado=publicado)
 * GET    /api/proyectos/:id      → uno por id
 * POST   /api/proyectos          → crear
 * PUT    /api/proyectos/:id      → reemplazar
 * DELETE /api/proyectos/:id      → eliminar
 */

import { Router, Request, Response, NextFunction } from 'express';
import * as repo from '../repositories/proyectos.repository';
import { validarProyecto, parsearDatos } from '../validators/proyecto.validator';

const router = Router();

// ── GET /api/proyectos ────────────────────────────────────────────────────────
// Devuelve todos los proyectos. Con ?estado=publicado filtra solo los publicados.
router.get('/', (req: Request, res: Response) => {
  const { estado } = req.query;
  const proyectos = repo.listar(typeof estado === 'string' ? estado : undefined);
  res.json(proyectos);
});

// ── GET /api/proyectos/:id ────────────────────────────────────────────────────
router.get('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'El id debe ser un número entero positivo.' });
    return;
  }

  const proyecto = repo.obtener(id);

  if (!proyecto) {
    res.status(404).json({ error: `No se encontró el proyecto con id ${id}.` });
    return;
  }

  res.json(proyecto);
});

// ── POST /api/proyectos ───────────────────────────────────────────────────────
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const errores = validarProyecto(req.body);

    if (errores.length > 0) {
      res.status(400).json({ error: 'Datos inválidos', detalles: errores });
      return;
    }

    const datos = parsearDatos(req.body as Record<string, unknown>);
    const creado = repo.crear(datos);

    res.status(201).json(creado);
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/proyectos/:id ────────────────────────────────────────────────────
router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'El id debe ser un número entero positivo.' });
      return;
    }

    const errores = validarProyecto(req.body);

    if (errores.length > 0) {
      res.status(400).json({ error: 'Datos inválidos', detalles: errores });
      return;
    }

    const datos = parsearDatos(req.body as Record<string, unknown>);
    const actualizado = repo.actualizar(id, datos);

    if (!actualizado) {
      res.status(404).json({ error: `No se encontró el proyecto con id ${id}.` });
      return;
    }

    res.json(actualizado);
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/proyectos/:id ─────────────────────────────────────────────────
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'El id debe ser un número entero positivo.' });
      return;
    }

    const eliminado = repo.eliminar(id);

    if (!eliminado) {
      res.status(404).json({ error: `No se encontró el proyecto con id ${id}.` });
      return;
    }

    // 204 No Content: eliminación exitosa, sin cuerpo de respuesta
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
