/**
 * db/seed.ts
 * Puebla la base de datos con los 3 proyectos reales del portfolio.
 * Es IDEMPOTENTE: si ya hay proyectos no los duplica.
 *
 * Ejecutar con: npm run seed
 */

import db from './connection';
import { DatosProyecto } from '../types/proyecto';

// Los 3 proyectos reales del portfolio de Matías Juncal
// Las rutas de imagen son relativas al frontend (img/proyectoN.jpeg)
const proyectosIniciales: DatosProyecto[] = [
  {
    nombre: 'Portfolio web personal',
    descripcion:
      'El sitio que estás viendo: presenta mi perfil, mis tecnologías y mis proyectos, con diseño adaptable y modo oscuro.',
    tecnologias: ['HTML', 'CSS', 'JavaScript', 'Git y GitHub'],
    imagenUrl: 'img/proyecto1.jpeg',
    enlaceUrl: 'https://github.com/mavancal/portfolio-juncal',
    estado: 'publicado',
  },
  {
    nombre: 'E-Commerce Online',
    descripcion:
      'Diseño de una tienda con catálogo de productos en tarjetas y base de datos.',
    tecnologias: ['HTML', 'CSS', 'JavaScript', 'PHP', 'SQL'],
    imagenUrl: 'img/proyecto2.jpeg',
    enlaceUrl: null,
    estado: 'publicado',
  },
  {
    nombre: 'App móvil de presupuestos',
    descripcion:
      'Aplicación móvil para android que agrega, completa y elimina presupuestos. Calcula costos y genera documentación para emprendedores.',
    tecnologias: ['Java', 'Kotlin', 'SQLite'],
    imagenUrl: 'img/proyecto3.jpeg',
    enlaceUrl: null,
    estado: 'publicado',
  },
];

// Verificar si ya hay datos para no duplicar (idempotente)
const cuenta = (db.prepare('SELECT COUNT(*) as total FROM proyectos').get() as { total: number }).total;

if (cuenta > 0) {
  console.log(`[Seed] Ya existen ${cuenta} proyectos en la BD. No se insertaron duplicados.`);
  process.exit(0);
}

// Insertar los proyectos iniciales dentro de una transacción
const insertar = db.prepare(`
  INSERT INTO proyectos (nombre, descripcion, tecnologias, imagen_url, enlace_url, estado)
  VALUES (@nombre, @descripcion, @tecnologias, @imagenUrl, @enlaceUrl, @estado)
`);

const insertarTodos = db.transaction((proyectos: DatosProyecto[]) => {
  for (const p of proyectos) {
    insertar.run({
      ...p,
      // Convertir el array de tecnologías a JSON para guardarlo en SQLite
      tecnologias: JSON.stringify(p.tecnologias),
    });
  }
});

insertarTodos(proyectosIniciales);

console.log(`[Seed] ${proyectosIniciales.length} proyectos insertados correctamente.`);
