-- schema.sql
-- Define la estructura de la tabla proyectos en SQLite.
-- Se ejecuta al iniciar el servidor (connection.ts), solo crea la tabla si no existe.

CREATE TABLE IF NOT EXISTS proyectos (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Datos obligatorios del proyecto
  nombre       TEXT NOT NULL,
  descripcion  TEXT NOT NULL,

  -- Tecnologías guardadas como JSON: '["HTML","CSS","JavaScript"]'
  -- Se convierte a array de strings al leer desde la API
  tecnologias  TEXT NOT NULL,

  -- Imagen y enlace son opcionales (pueden ser NULL)
  imagen_url   TEXT,
  enlace_url   TEXT,

  -- Estado: solo 'publicado' o 'borrador' (CHECK lo enforza en la BD)
  estado       TEXT NOT NULL DEFAULT 'borrador'
               CHECK (estado IN ('publicado', 'borrador')),

  -- Fechas automáticas: SQLite las completa si no se pasan valores
  creado_en    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  actualizado_en TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
