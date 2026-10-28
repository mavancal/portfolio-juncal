/**
 * repositories/proyectos.repository.ts
 * Capa de acceso a datos: todas las operaciones sobre la tabla proyectos.
 *
 * Responsabilidades:
 *  - Ejecutar consultas SQL parametrizadas (nunca concatenar SQL → evita inyección)
 *  - Convertir snake_case (SQLite) ↔ camelCase (TypeScript/JSON)
 *  - Convertir tecnologias: JSON string ↔ string[]
 */

import db from '../db/connection';
import { Proyecto, DatosProyecto, EstadoPublicacion } from '../types/proyecto';

// ── Tipo interno que refleja la fila tal como la devuelve SQLite ──────────────
interface FilaProyecto {
  id: number;
  nombre: string;
  descripcion: string;
  tecnologias: string;   // JSON en la BD, ej: '["HTML","CSS"]'
  imagen_url: string | null;
  enlace_url: string | null;
  estado: EstadoPublicacion;
  creado_en: string;
  actualizado_en: string;
}

// Convierte una fila de SQLite al objeto Proyecto tipado (snake_case → camelCase)
function filaAProyecto(fila: FilaProyecto): Proyecto {
  return {
    id: fila.id,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    tecnologias: JSON.parse(fila.tecnologias) as string[],
    imagenUrl: fila.imagen_url,
    enlaceUrl: fila.enlace_url,
    estado: fila.estado,
    creadoEn: fila.creado_en,
    actualizadoEn: fila.actualizado_en,
  };
}

// ── Listar proyectos (con filtro opcional por estado) ─────────────────────────
export function listar(estado?: string): Proyecto[] {
  let filas: FilaProyecto[];

  if (estado === 'publicado' || estado === 'borrador') {
    filas = db
      .prepare('SELECT * FROM proyectos WHERE estado = ? ORDER BY id DESC')
      .all(estado) as FilaProyecto[];
  } else {
    filas = db
      .prepare('SELECT * FROM proyectos ORDER BY id DESC')
      .all() as FilaProyecto[];
  }

  return filas.map(filaAProyecto);
}

// ── Obtener un proyecto por id ────────────────────────────────────────────────
export function obtener(id: number): Proyecto | null {
  const fila = db
    .prepare('SELECT * FROM proyectos WHERE id = ?')
    .get(id) as FilaProyecto | undefined;

  return fila ? filaAProyecto(fila) : null;
}

// ── Crear un proyecto nuevo ───────────────────────────────────────────────────
export function crear(datos: DatosProyecto): Proyecto {
  const resultado = db
    .prepare(
      `INSERT INTO proyectos (nombre, descripcion, tecnologias, imagen_url, enlace_url, estado)
       VALUES (@nombre, @descripcion, @tecnologias, @imagenUrl, @enlaceUrl, @estado)`
    )
    .run({
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      tecnologias: JSON.stringify(datos.tecnologias),
      imagenUrl: datos.imagenUrl,
      enlaceUrl: datos.enlaceUrl,
      estado: datos.estado,
    });

  // Recuperar el proyecto recién insertado con su id y fechas generadas por la BD
  return obtener(resultado.lastInsertRowid as number) as Proyecto;
}

// ── Actualizar un proyecto existente ──────────────────────────────────────────
export function actualizar(id: number, datos: DatosProyecto): Proyecto | null {
  const cambios = db
    .prepare(
      `UPDATE proyectos
       SET nombre = @nombre,
           descripcion = @descripcion,
           tecnologias = @tecnologias,
           imagen_url = @imagenUrl,
           enlace_url = @enlaceUrl,
           estado = @estado,
           actualizado_en = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
       WHERE id = @id`
    )
    .run({
      id,
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      tecnologias: JSON.stringify(datos.tecnologias),
      imagenUrl: datos.imagenUrl,
      enlaceUrl: datos.enlaceUrl,
      estado: datos.estado,
    }).changes;

  // changes === 0 significa que no existía el id
  return cambios > 0 ? obtener(id) : null;
}

// ── Eliminar un proyecto ──────────────────────────────────────────────────────
export function eliminar(id: number): boolean {
  const cambios = db
    .prepare('DELETE FROM proyectos WHERE id = ?')
    .run(id).changes;

  return cambios > 0;
}
