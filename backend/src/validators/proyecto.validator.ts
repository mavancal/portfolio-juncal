/**
 * validators/proyecto.validator.ts
 * Valida los datos que llegan en el body de POST y PUT.
 * Devuelve un array de mensajes de error (vacío si todo está OK).
 *
 * Reglas:
 *  - nombre: 3–80 caracteres
 *  - descripcion: 10–500 caracteres
 *  - tecnologias: array de 1 a 15 strings no vacíos
 *  - AL MENOS uno entre imagenUrl o enlaceUrl
 *  - enlaceUrl: debe ser http o https si se provee
 *  - imagenUrl: puede ser http/https o ruta relativa tipo img/archivo.ext
 *  - estado: solo 'publicado' o 'borrador'
 */

import { DatosProyecto, EstadoPublicacion } from '../types/proyecto';

// Expresión regular para URLs absolutas http/https
const PATRON_URL = /^https?:\/\/.+/i;

// Expresión regular para rutas relativas de imagen (ej: img/proyecto1.jpeg)
const PATRON_RUTA_IMG = /^[\w\-./]+\.(jpe?g|png|gif|webp|svg|avif)$/i;

const ESTADOS_VALIDOS: EstadoPublicacion[] = ['publicado', 'borrador'];

export function validarProyecto(datos: unknown): string[] {
  const errores: string[] = [];

  // Verificar que el body sea un objeto
  if (typeof datos !== 'object' || datos === null || Array.isArray(datos)) {
    return ['El cuerpo de la solicitud debe ser un objeto JSON.'];
  }

  // Usar un tipo intermedio para acceder a las propiedades sin riesgo
  const d = datos as Record<string, unknown>;

  // ── nombre ────────────────────────────────────────────────────────────────
  if (typeof d.nombre !== 'string' || d.nombre.trim().length < 3) {
    errores.push('El nombre debe tener al menos 3 caracteres.');
  } else if (d.nombre.trim().length > 80) {
    errores.push('El nombre no puede superar los 80 caracteres.');
  }

  // ── descripcion ───────────────────────────────────────────────────────────
  if (typeof d.descripcion !== 'string' || d.descripcion.trim().length < 10) {
    errores.push('La descripción debe tener al menos 10 caracteres.');
  } else if (d.descripcion.trim().length > 500) {
    errores.push('La descripción no puede superar los 500 caracteres.');
  }

  // ── tecnologias ───────────────────────────────────────────────────────────
  if (!Array.isArray(d.tecnologias)) {
    errores.push('El campo tecnologías debe ser un array.');
  } else if (d.tecnologias.length < 1 || d.tecnologias.length > 15) {
    errores.push('El campo tecnologías debe tener entre 1 y 15 elementos.');
  } else if (d.tecnologias.some((t) => typeof t !== 'string' || t.trim() === '')) {
    errores.push('Cada tecnología debe ser un texto no vacío.');
  }

  // ── imagenUrl ─────────────────────────────────────────────────────────────
  // Puede ser null, pero si se provee debe ser URL http/https o ruta relativa
  if (d.imagenUrl !== null && d.imagenUrl !== undefined) {
    if (typeof d.imagenUrl !== 'string') {
      errores.push('imagenUrl debe ser un texto o null.');
    } else if (!PATRON_URL.test(d.imagenUrl) && !PATRON_RUTA_IMG.test(d.imagenUrl)) {
      errores.push(
        'imagenUrl debe ser una URL (https://...) o una ruta relativa de imagen (ej: img/proyecto1.jpeg).'
      );
    }
  }

  // ── enlaceUrl ─────────────────────────────────────────────────────────────
  // Puede ser null, pero si se provee debe ser URL http/https
  if (d.enlaceUrl !== null && d.enlaceUrl !== undefined) {
    if (typeof d.enlaceUrl !== 'string') {
      errores.push('enlaceUrl debe ser un texto o null.');
    } else if (!PATRON_URL.test(d.enlaceUrl)) {
      errores.push('enlaceUrl debe ser una URL válida que empiece con http:// o https://');
    }
  }

  // ── Al menos uno entre imagenUrl y enlaceUrl ──────────────────────────────
  const tieneImagen =
    typeof d.imagenUrl === 'string' && d.imagenUrl.trim() !== '';
  const tieneEnlace =
    typeof d.enlaceUrl === 'string' && d.enlaceUrl.trim() !== '';

  if (!tieneImagen && !tieneEnlace) {
    errores.push('El proyecto debe tener al menos una imagen o un enlace.');
  }

  // ── estado ────────────────────────────────────────────────────────────────
  if (!ESTADOS_VALIDOS.includes(d.estado as EstadoPublicacion)) {
    errores.push(`El estado debe ser "publicado" o "borrador".`);
  }

  return errores;
}

/**
 * Construye un objeto DatosProyecto limpio a partir del body de la solicitud.
 * Llamar solo después de validarProyecto() sin errores.
 */
export function parsearDatos(body: Record<string, unknown>): DatosProyecto {
  return {
    nombre: (body.nombre as string).trim(),
    descripcion: (body.descripcion as string).trim(),
    tecnologias: (body.tecnologias as string[]).map((t) => t.trim()),
    imagenUrl: body.imagenUrl ? (body.imagenUrl as string).trim() : null,
    enlaceUrl: body.enlaceUrl ? (body.enlaceUrl as string).trim() : null,
    estado: body.estado as EstadoPublicacion,
  };
}
