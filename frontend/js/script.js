'use strict';

/* vars y const */
const CLAVE_TEMA = 'portfolio-tema';
const MIN_NOMBRE = 3;
const MIN_MENSAJE = 10;
const MAX_MENSAJE = 300; 
const UMBRAL_AVISO = 0.9;
const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

let temaActual = 'claro'; 
let intentosEnvio = 0;
let hayErrores = false;

const motivos = ['proyecto', 'consulta', 'colaboracion'];
const configuracion = {
  sitio: 'Portfolio de Matías Juncal',
  mostrarContador: true,
  idioma: 'es'
};

const raiz = document.documentElement;
const botonTema = document.querySelector('#btn-tema');
const textoTema = document.querySelector('.tema-texto');
const botonMenu = document.querySelector('#btn-menu');
const menu = document.querySelector('#menu-principal');

const botonesFiltro = document.querySelectorAll('.filtro');
const itemsTecnologia = document.querySelectorAll('#lista-tecnologias .chip');

const buscador = document.querySelector('#buscador-proyectos');
const galeria = document.querySelector('#galeria-proyectos');
const tarjetasProyecto = document.querySelectorAll('.tarjeta-proyecto');
const cantidadProyectos = document.querySelector('#cantidad-proyectos');

const formulario = document.querySelector('#form-contacto');
const campoMotivo = document.querySelector('#motivo');
const campoMensaje = document.querySelector('#mensaje');
const contadorMensaje = document.querySelector('#contador-mensaje');
const estado = document.querySelector('#estado');
const camposValidables = document.querySelectorAll('#nombre, #email, #motivo, #mensaje');

function obtenerTemaInicial() {
  let guardado = null;
  try {
    guardado = localStorage.getItem(CLAVE_TEMA);
  } catch (error) {
    guardado = null;
  }

  if (guardado === 'claro' || guardado === 'oscuro') {
    return guardado;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
}

function aplicarTema(tema) {
  temaActual = tema;
  const esOscuro = temaActual === 'oscuro';

  raiz.setAttribute('data-tema', temaActual);
  botonTema.setAttribute('aria-pressed', String(esOscuro));
  textoTema.textContent = esOscuro ? 'Modo claro' : 'Modo oscuro';

  try {
    localStorage.setItem(CLAVE_TEMA, temaActual);
  } catch (error) {
  }
}

botonTema.addEventListener('click', function () {
  aplicarTema(temaActual === 'claro' ? 'oscuro' : 'claro');
});

function alternarMenu() {
  const abierto = menu.classList.toggle('abierto');
  botonMenu.setAttribute('aria-expanded', String(abierto));
}

botonMenu.addEventListener('click', alternarMenu);

menu.addEventListener('click', function (evento) {
  const tocoUnEnlace = evento.target.tagName === 'A';
  if (tocoUnEnlace && menu.classList.contains('abierto')) {
    alternarMenu();
  }
});

function filtrarTecnologias(categoria) {
  for (const item of itemsTecnologia) {
    const coincide = categoria === 'todas' || item.dataset.categoria === categoria;
    item.hidden = !coincide;
  }
}

botonesFiltro.forEach(function (boton) {
  boton.addEventListener('click', function () {
    botonesFiltro.forEach(function (otro) {
      otro.classList.remove('activo');
      otro.setAttribute('aria-pressed', 'false');
    });
    boton.classList.add('activo');
    boton.setAttribute('aria-pressed', 'true');

    filtrarTecnologias(boton.dataset.filtro);
  });
});

function buscarProyectos() {
  const texto = buscador.value.trim().toLowerCase();
  let visibles = 0;

  tarjetasProyecto.forEach(function (tarjeta) {
    const contenido = tarjeta.textContent.toLowerCase();
    const coincide = contenido.includes(texto);
    tarjeta.hidden = !coincide;

    if (coincide) {
      visibles++;
    }
  });

  let aviso = document.querySelector('#sin-resultados');

  if (visibles === 0) {
    if (!aviso) {
      aviso = document.createElement('p');
      aviso.id = 'sin-resultados';
      aviso.className = 'aviso';
      galeria.after(aviso);
    }
    aviso.textContent = `No hay proyectos que coincidan con "${buscador.value.trim()}". Probá con otra palabra o tecnología.`;
  } else if (aviso) {
    aviso.remove();
  }

  cantidadProyectos.textContent = `Mostrando ${visibles} de ${tarjetasProyecto.length} proyectos`;
}

buscador.addEventListener('input', buscarProyectos);

/* formulario*/

const reglas = {
  nombre: function (valor) {
    if (valor === '') {
      return 'Ingresá tu nombre.';
    }
    if (valor.length < MIN_NOMBRE) {
      return `El nombre debe tener al menos ${MIN_NOMBRE} caracteres.`;
    }
    return '';
  },

  email: function (valor) {
    if (valor === '') {
      return 'Ingresá tu email.';
    }
    if (!PATRON_EMAIL.test(valor)) {
      return 'Ingresá un email válido, por ejemplo nombre@dominio.com.';
    }
    return '';
  },

  motivo: function (valor) {
    return motivos.includes(valor) ? '' : 'Elegí un motivo de contacto.';
  },

  mensaje: function (valor) {
    if (valor.length < MIN_MENSAJE) {
      return `El mensaje debe tener al menos ${MIN_MENSAJE} caracteres.`;
    }
    if (valor.length > MAX_MENSAJE) {
      return `El mensaje no puede superar los ${MAX_MENSAJE} caracteres.`;
    }
    return '';
  }
};

function mostrarError(campo, texto) {
  const idError = `error-${campo.id}`;
  let aviso = document.getElementById(idError);

  if (!aviso) {
    aviso = document.createElement('p');
    aviso.id = idError;
    aviso.className = 'error-campo';
    campo.parentElement.appendChild(aviso);
  }

  aviso.textContent = texto;
  campo.setAttribute('aria-invalid', 'true');
  campo.setAttribute('aria-describedby', idError);
}

function limpiarError(campo) {
  const aviso = document.getElementById(`error-${campo.id}`);
  if (aviso) {
    aviso.remove();
  }
  campo.removeAttribute('aria-invalid');
  campo.removeAttribute('aria-describedby');
}

function validarCampo(campo) {
  const valor = campo.value.trim();
  const textoError = reglas[campo.name](valor);

  if (textoError !== '') {
    mostrarError(campo, textoError);
    return false;
  }

  limpiarError(campo);
  return true;
}

function sugerenciaSegunMotivo(motivo) {
  switch (motivo) {
    case 'proyecto':
      return 'Contame qué necesitás y para cuándo.';
    case 'consulta':
      return 'Escribí tu consulta con el mayor detalle posible.';
    case 'colaboracion':
      return 'Contame de qué trata la colaboración que imaginás.';
    default:
      return 'Escribí tu mensaje';
  }
}

function actualizarContador() {
  const cantidad = campoMensaje.value.length;
  contadorMensaje.textContent = `${cantidad} / ${MAX_MENSAJE}`;
  contadorMensaje.classList.toggle('limite', cantidad >= MAX_MENSAJE * UMBRAL_AVISO);
}

function mostrarConfirmacion(datos) {
  estado.className = 'estado ok';
  estado.replaceChildren();

  const titulo = document.createElement('h3');
  titulo.textContent = `¡Gracias, ${datos.nombre}!`;

  const texto = document.createElement('p');
  texto.textContent = `Recibí tu mensaje sobre "${datos.motivo}". Te respondo a ${datos.email} lo antes posible.`;

  estado.append(titulo, texto);

  if (datos.copia) {
    const nota = document.createElement('p');
    nota.textContent = 'Marcaste la opción de recibir una copia de tu mensaje.';
    estado.appendChild(nota);
  }
}

camposValidables.forEach(function (campo) {
  campo.addEventListener('blur', function () {
    validarCampo(campo);
  });

  campo.addEventListener('input', function () {
    if (campo.getAttribute('aria-invalid') === 'true') {
      validarCampo(campo);
    }
  });
});

campoMensaje.addEventListener('input', function () {
  if (configuracion.mostrarContador) {
    actualizarContador();
  }
});

campoMotivo.addEventListener('change', function () {
  campoMensaje.placeholder = sugerenciaSegunMotivo(campoMotivo.value);
  validarCampo(campoMotivo);
});

formulario.addEventListener('submit', function (evento) {
  evento.preventDefault();
  intentosEnvio++;
  hayErrores = false;
  let primerCampoInvalido = null;

  for (const campo of camposValidables) {
    const esValido = validarCampo(campo);
    if (!esValido) {
      hayErrores = true;
      if (primerCampoInvalido === null) {
        primerCampoInvalido = campo;
      }
    }
  }

  if (hayErrores) {
    estado.className = 'estado error';
    estado.textContent = 'Revisá los campos marcados en rojo antes de enviar.';
    primerCampoInvalido.focus();
    return;
  }

  const datos = {
    nombre: formulario.elements['nombre'].value.trim(),
    email: formulario.elements['email'].value.trim(),
    motivo: campoMotivo.options[campoMotivo.selectedIndex].textContent.toLowerCase(),
    copia: formulario.elements['copia'].checked
  };

  mostrarConfirmacion(datos);
  formulario.reset();
  campoMensaje.placeholder = sugerenciaSegunMotivo('');
  actualizarContador();
  console.log(`Formulario enviado correctamente (intentos: ${intentosEnvio}).`);
});

/* añop */
function mostrarAnioActual() {
  const anio = document.querySelector('#anio');
  anio.textContent = new Date().getFullYear();
}

aplicarTema(obtenerTemaInicial());
buscarProyectos();
actualizarContador();
mostrarAnioActual();
