/**
 * tipos/proyecto.ts
 * Define los tipos TypeScript para la entidad Proyecto.
 * Estos tipos se usan en el repositorio, el validador y las rutas.
 * TypeScript los verifica en tiempo de compilación: si escribís un estado inválido,
 * el compilador lanza un error ANTES de ejecutar el código.
 */

// ── Tipo unión para el estado de publicación ──────────────────────────────────
// Solo se aceptan exactamente estos dos valores. Cualquier otro causa error al compilar.
export type EstadoPublicacion = 'publicado' | 'borrador';

// ── Interfaz principal de Proyecto ────────────────────────────────────────────
// Define la "forma" exacta de un objeto proyecto tal como lo devuelve la API.
export interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  tecnologias: string[];          // Array de strings; en la BD se guarda como JSON
  imagenUrl: string | null;       // null si no tiene imagen
  enlaceUrl: string | null;       // null si no tiene enlace externo
  estado: EstadoPublicacion;      // Solo 'publicado' o 'borrador'
  creadoEn: string;               // Fecha ISO 8601
  actualizadoEn: string;          // Fecha ISO 8601
}

// ── Tipo para crear o modificar un proyecto ───────────────────────────────────
// Omite los campos que genera la BD automáticamente (id, fechas).
// Se usa en POST (crear) y PUT (reemplazar).
export type DatosProyecto = Omit<Proyecto, 'id' | 'creadoEn' | 'actualizadoEn'>;

// ── Ejemplo de array tipado (ilustrativo para la defensa) ─────────────────────
// TypeScript garantiza que cada elemento cumpla la interfaz Proyecto.
// Si intentás agregar { estado: 'eliminado' }, el compilador rechaza el código.
export const ejemploProyectos: Proyecto[] = [
  {
    id: 1,
    nombre: 'Portfolio web personal',
    descripcion: 'El sitio que estás viendo.',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    imagenUrl: 'img/proyecto1.jpeg',
    enlaceUrl: 'https://github.com/mavancal/portfolio-juncal',
    estado: 'publicado',          // ← Solo 'publicado' o 'borrador' son válidos
    creadoEn: '2024-01-01T00:00:00.000Z',
    actualizadoEn: '2024-01-01T00:00:00.000Z',
  },
];

/*
 * ── EJEMPLO DE ERROR DE COMPILACIÓN ──────────────────────────────────────────
 * Si descomentás la línea de abajo, `npm run build` falla con:
 *
 *   Type '"eliminado"' is not assignable to type 'EstadoPublicacion'.
 *
 * Esto es el tipado estático en acción: el error aparece ANTES de ejecutar.
 *
 * const proyectoInvalido: Proyecto = {
 *   id: 99, nombre: 'Test', descripcion: 'desc', tecnologias: [],
 *   imagenUrl: null, enlaceUrl: null,
 *   estado: 'eliminado',   // ← ERROR de compilación aquí
 *   creadoEn: '', actualizadoEn: '',
 * };
 */
