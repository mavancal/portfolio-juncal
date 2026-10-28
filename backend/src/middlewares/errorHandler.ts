/**
 * middlewares/errorHandler.ts
 * Captura cualquier error que llegue con next(err) y devuelve 500 en JSON.
 * Al tener 4 parámetros, Express lo reconoce como manejador de errores.
 */

import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // Loguear el error en el servidor para depuración
  console.error('[ErrorHandler]', err.message);

  res.status(500).json({ error: 'Error interno del servidor' });
}
