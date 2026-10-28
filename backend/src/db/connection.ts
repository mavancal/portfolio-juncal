/**
 * db/connection.ts
 * Abre (o crea) el archivo de base de datos SQLite y ejecuta el esquema inicial.
 * better-sqlite3 es síncrono: no requiere async/await, lo que simplifica el código.
 *
 * Persistencia: el archivo .db vive en disco (ruta definida en DB_PATH del .env).
 * Detener y reiniciar el servidor NO borra los datos.
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Ruta del archivo SQLite, definida en .env
const DB_PATH = process.env.DB_PATH ?? './data/portfolio.db';

// Crear la carpeta si no existe (ej: ./data/)
const carpeta = path.dirname(DB_PATH);
if (!fs.existsSync(carpeta)) {
  fs.mkdirSync(carpeta, { recursive: true });
}

// Abrir (o crear) el archivo de base de datos
const db = new Database(DB_PATH);

// Activar WAL para mejor rendimiento en escrituras concurrentes
db.pragma('journal_mode = WAL');

// Leer el esquema SQL y ejecutarlo
// CREATE TABLE IF NOT EXISTS garantiza que no falla si la tabla ya existe
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

console.log(`[DB] Conectado a ${DB_PATH}`);

export default db;
