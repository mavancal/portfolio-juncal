/**
 * js/api.js
 * Funciones para comunicarse con el backend mediante fetch.
 * Script clásico (sin módulos ES): se carga antes que script.js.
 *
 * Nombres con prefijo "api" para no chocar con las constantes
 * globales de script.js (galeria, buscador, estado, formulario…).
 */

'use strict';

// URL base del backend — cambiar si se despliega en otro host/puerto
var API_URL = 'http://localhost:3000/api';

/**
 * Obtiene la lista de proyectos.
 * @param {boolean} soloPublicados - Si es true, filtra solo los publicados.
 * @returns {Promise<Array>} Array de objetos proyecto.
 */
async function apiObtenerProyectos(soloPublicados) {
  var url = soloPublicados
    ? API_URL + '/proyectos?estado=publicado'
    : API_URL + '/proyectos';

  var respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error('Error al obtener proyectos: ' + respuesta.status);
  }

  return respuesta.json();
}

/**
 * Crea un proyecto nuevo.
 * @param {Object} datos - Datos del proyecto (sin id ni fechas).
 * @returns {Promise<Object>} El proyecto creado con su id.
 */
async function apiCrearProyecto(datos) {
  var respuesta = await fetch(API_URL + '/proyectos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });

  var cuerpo = await respuesta.json();

  if (!respuesta.ok) {
    // Propagar los detalles de validación para mostrarlos en el formulario
    var error = new Error(cuerpo.error || 'Error al crear el proyecto');
    error.detalles = cuerpo.detalles || [];
    throw error;
  }

  return cuerpo;
}

/**
 * Actualiza un proyecto existente.
 * @param {number} id - Id del proyecto.
 * @param {Object} datos - Datos actualizados.
 * @returns {Promise<Object>} El proyecto actualizado.
 */
async function apiActualizarProyecto(id, datos) {
  var respuesta = await fetch(API_URL + '/proyectos/' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });

  var cuerpo = await respuesta.json();

  if (!respuesta.ok) {
    var error = new Error(cuerpo.error || 'Error al actualizar el proyecto');
    error.detalles = cuerpo.detalles || [];
    throw error;
  }

  return cuerpo;
}

/**
 * Elimina un proyecto.
 * @param {number} id - Id del proyecto a eliminar.
 * @returns {Promise<void>}
 */
async function apiEliminarProyecto(id) {
  var respuesta = await fetch(API_URL + '/proyectos/' + id, {
    method: 'DELETE',
  });

  if (!respuesta.ok) {
    var cuerpo = await respuesta.json();
    throw new Error(cuerpo.error || 'Error al eliminar el proyecto');
  }
}
