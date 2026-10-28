/**
 * js/admin.js
 * Lógica del panel de administración de proyectos.
 * Todo el código va dentro de un IIFE para no contaminar el ámbito global
 * (api.js ya está cargado antes y expone apiCrearProyecto, etc.).
 */

(function () {
  'use strict';

  // ── Aplicar tema guardado ────────────────────────────────────────────────
  // Lee la preferencia de script.js (localStorage) o usa prefers-color-scheme
  (function aplicarTemaAdmin() {
    var temaGuardado = null;
    try {
      temaGuardado = localStorage.getItem('portfolio-tema');
    } catch (_e) {
      temaGuardado = null;
    }

    var tema;
    if (temaGuardado === 'claro' || temaGuardado === 'oscuro') {
      tema = temaGuardado;
    } else {
      tema = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'oscuro'
        : 'claro';
    }

    document.documentElement.setAttribute('data-tema', tema);
  })();

  // ── Referencias al DOM ───────────────────────────────────────────────────
  var form          = document.querySelector('#form-admin');
  var campoNombre   = document.querySelector('#admin-nombre');
  var campoDesc     = document.querySelector('#admin-descripcion');
  var campoTecs     = document.querySelector('#admin-tecnologias');
  var campoImagen   = document.querySelector('#admin-imagen-url');
  var campoEnlace   = document.querySelector('#admin-enlace-url');
  var campoEstado   = document.querySelector('#admin-estado-proyecto');
  var adminEstado   = document.querySelector('#admin-estado');
  var btnGuardar    = document.querySelector('#admin-btn-guardar');
  var btnCancelar   = document.querySelector('#admin-btn-cancelar');
  var listaAdmin    = document.querySelector('#lista-admin');
  var listaEstado   = document.querySelector('#admin-lista-estado');
  var tituloForm    = document.querySelector('#titulo-form-admin');

  // Id del proyecto que se está editando (null = modo creación)
  var idEditando = null;

  // ── Mostrar mensaje de estado del formulario ─────────────────────────────
  function mostrarEstadoForm(mensaje, tipo) {
    // tipo: 'ok' | 'error'
    adminEstado.className = 'estado ' + tipo;
    adminEstado.textContent = mensaje;
    // Hacer scroll al aviso para que sea visible en celular
    adminEstado.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function limpiarEstadoForm() {
    adminEstado.className = 'estado';
    adminEstado.textContent = '';
  }

  // ── Mostrar errores de campo ─────────────────────────────────────────────
  function mostrarErroresCampo(detalles) {
    // Limpiar errores anteriores
    form.querySelectorAll('.error-campo').forEach(function (el) { el.remove(); });
    form.querySelectorAll('[aria-invalid]').forEach(function (el) {
      el.removeAttribute('aria-invalid');
    });

    if (!detalles || detalles.length === 0) return;

    // Mostrar cada error debajo del campo más relacionado
    var mapaCampos = {
      'nombre': campoNombre,
      'descripci': campoDesc,
      'tecnolog': campoTecs,
      'imagen': campoImagen,
      'enlace': campoEnlace,
      'estado': campoEstado,
    };

    // Poner todos los errores bajo el primer campo inválido detectado
    var primerCampo = null;

    detalles.forEach(function (detalle) {
      var campo = null;
      Object.keys(mapaCampos).forEach(function (clave) {
        if (detalle.toLowerCase().includes(clave)) {
          campo = mapaCampos[clave];
        }
      });

      if (campo) {
        campo.setAttribute('aria-invalid', 'true');
        var p = document.createElement('p');
        p.className = 'error-campo';
        p.textContent = detalle;
        campo.parentElement.appendChild(p);
        if (!primerCampo) primerCampo = campo;
      }
    });

    if (primerCampo) {
      primerCampo.focus();
    }
  }

  // ── Limpiar errores de campo ─────────────────────────────────────────────
  function limpiarErroresCampo() {
    form.querySelectorAll('.error-campo').forEach(function (el) { el.remove(); });
    form.querySelectorAll('[aria-invalid]').forEach(function (el) {
      el.removeAttribute('aria-invalid');
    });
  }

  // ── Resetear formulario al modo creación ─────────────────────────────────
  function resetearFormulario() {
    form.reset();
    idEditando = null;
    tituloForm.textContent = 'Nuevo proyecto';
    btnGuardar.textContent = 'Guardar proyecto';
    btnCancelar.hidden = true;
    limpiarEstadoForm();
    limpiarErroresCampo();
    campoNombre.focus();
  }

  // ── Cargar datos de un proyecto en el formulario para editarlo ───────────
  function cargarEnFormulario(proyecto) {
    idEditando = proyecto.id;
    tituloForm.textContent = 'Editar proyecto';
    btnGuardar.textContent = 'Actualizar proyecto';
    btnCancelar.hidden = false;
    limpiarEstadoForm();
    limpiarErroresCampo();

    campoNombre.value   = proyecto.nombre;
    campoDesc.value     = proyecto.descripcion;
    campoTecs.value     = proyecto.tecnologias.join(', ');
    campoImagen.value   = proyecto.imagenUrl || '';
    campoEnlace.value   = proyecto.enlaceUrl || '';
    campoEstado.value   = proyecto.estado;

    // Hacer scroll al formulario y enfocar el primer campo
    tituloForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    campoNombre.focus();
  }

  // ── Construir un elemento de la lista de proyectos ───────────────────────
  function crearItemLista(proyecto) {
    var li = document.createElement('li');
    li.className = 'lista-admin-item tarjeta';
    li.dataset.id = proyecto.id;

    // Encabezado con nombre y estado
    var encabezado = document.createElement('div');
    encabezado.className = 'lista-admin-encabezado';

    var nombre = document.createElement('strong');
    nombre.textContent = proyecto.nombre;

    // Chip de estado con texto (no solo color)
    var chipEstado = document.createElement('span');
    chipEstado.className = 'lista-admin-estado lista-admin-estado--' + proyecto.estado;
    chipEstado.textContent = proyecto.estado === 'publicado' ? '✓ Publicado' : '○ Borrador';

    encabezado.appendChild(nombre);
    encabezado.appendChild(chipEstado);

    // Tecnologías en texto breve
    var tecs = document.createElement('p');
    tecs.className = 'lista-admin-tecs';
    tecs.textContent = proyecto.tecnologias.join(' · ');

    // Botones Editar / Eliminar
    var acciones = document.createElement('div');
    acciones.className = 'lista-admin-acciones';

    var btnEditar = document.createElement('button');
    btnEditar.className = 'boton boton-secundario boton-sm';
    btnEditar.type = 'button';
    btnEditar.textContent = 'Editar';
    btnEditar.addEventListener('click', function () {
      cargarEnFormulario(proyecto);
    });

    var btnEliminar = document.createElement('button');
    btnEliminar.className = 'boton boton-peligro boton-sm';
    btnEliminar.type = 'button';
    btnEliminar.textContent = 'Eliminar';
    btnEliminar.addEventListener('click', function () {
      eliminarProyecto(proyecto.id, proyecto.nombre);
    });

    acciones.appendChild(btnEditar);
    acciones.appendChild(btnEliminar);

    li.appendChild(encabezado);
    li.appendChild(tecs);
    li.appendChild(acciones);

    return li;
  }

  // ── Cargar y renderizar la lista de proyectos ────────────────────────────
  async function cargarLista() {
    listaEstado.textContent = 'Cargando…';
    listaAdmin.replaceChildren();

    try {
      var proyectos = await apiObtenerProyectos(false); // todos, incluye borradores

      if (proyectos.length === 0) {
        listaEstado.textContent = 'No hay proyectos todavía. Creá el primero con el formulario.';
        return;
      }

      listaEstado.textContent = '';
      proyectos.forEach(function (p) {
        listaAdmin.appendChild(crearItemLista(p));
      });
    } catch (_err) {
      listaEstado.textContent =
        'No se pudo conectar con el servidor. Verificá que el backend esté en ejecución.';
    }
  }

  // ── Eliminar un proyecto ─────────────────────────────────────────────────
  async function eliminarProyecto(id, nombre) {
    if (!confirm('¿Eliminar el proyecto "' + nombre + '"? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await apiEliminarProyecto(id);
      // Si se estaba editando ese mismo proyecto, resetear el formulario
      if (idEditando === id) {
        resetearFormulario();
      }
      await cargarLista();
    } catch (err) {
      mostrarEstadoForm('Error al eliminar: ' + err.message, 'error');
    }
  }

  // ── Manejar envío del formulario (crear o actualizar) ────────────────────
  form.addEventListener('submit', async function (evento) {
    evento.preventDefault();
    limpiarErroresCampo();
    limpiarEstadoForm();

    // Convertir tecnologías de texto separado por coma a array
    var tecnologias = campoTecs.value
      .split(',')
      .map(function (t) { return t.trim(); })
      .filter(function (t) { return t !== ''; });

    var datos = {
      nombre:      campoNombre.value,
      descripcion: campoDesc.value,
      tecnologias: tecnologias,
      imagenUrl:   campoImagen.value.trim() || null,
      enlaceUrl:   campoEnlace.value.trim() || null,
      estado:      campoEstado.value,
    };

    try {
      if (idEditando === null) {
        // ── Crear ────────────────────────────────────────────────────────
        await apiCrearProyecto(datos);
        mostrarEstadoForm('✓ Proyecto creado correctamente.', 'ok');
        resetearFormulario();
      } else {
        // ── Actualizar ───────────────────────────────────────────────────
        await apiActualizarProyecto(idEditando, datos);
        mostrarEstadoForm('✓ Proyecto actualizado correctamente.', 'ok');
        resetearFormulario();
      }

      // Recargar lista para reflejar los cambios
      await cargarLista();

    } catch (err) {
      mostrarEstadoForm(
        (idEditando === null ? 'Error al crear' : 'Error al actualizar') +
        ': ' + err.message,
        'error'
      );
      // Mostrar errores de validación campo por campo si los hay
      if (err.detalles && err.detalles.length > 0) {
        mostrarErroresCampo(err.detalles);
      }
    }
  });

  // ── Cancelar edición ─────────────────────────────────────────────────────
  btnCancelar.addEventListener('click', resetearFormulario);

  // ── Inicialización ───────────────────────────────────────────────────────
  cargarLista();

})();
