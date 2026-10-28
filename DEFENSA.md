# Guion para la defensa oral del Portfolio Web
**Estudiante:** Matías Juncal  
**Actividad Integradora:** Unidades 3, 4, 5 y 6 — Backend y persistencia de datos  
**Tiempo estimado:** 5 a 7 minutos

---

## 1. Demostración en vivo del CRUD (Paso a paso)

Para la demostración en vivo, tener levantado el backend (`npm run dev` en `backend/`) y el frontend con Live Server o `npx serve frontend`.

1. **Consultar (Lectura pública):**
   - Abrir el portfolio principal (`index.html`).
   - Mostrar la sección `#proyectos`: explicar que las tarjetas ya no están escritas a mano en el HTML, sino que se solicitan mediante `fetch` al backend (`GET /api/proyectos?estado=publicado`) y se renderizan dinámicamente con JavaScript.
   - Demostrar que el buscador en tiempo real sigue filtrando correctamente sobre las tarjetas inyectadas dinámicamente.

2. **Crear (Alta de proyecto):**
   - Abrir el panel de administración (`admin.html`).
   - Completar el formulario con un proyecto nuevo:
     - Nombre: `Sistema de Turnos`
     - Descripción: `Aplicación web para gestión de citas médicas con notificaciones automáticas.`
     - Tecnologías: `Node.js, Express, SQLite`
     - Imagen: `img/placeholder-proyecto.svg`
     - Enlace: `https://github.com/mavancal/sistema-turnos`
     - Estado: `Publicado`
   - Clic en **"Guardar proyecto"**. Mostrar el mensaje de éxito en pantalla y cómo aparece de inmediato al inicio de la lista inferior.
   - Volver a `index.html`, recargar y mostrar que el nuevo proyecto ya aparece en la galería pública.

3. **Modificar (Edición y cambio de estado):**
   - En `admin.html`, buscar el proyecto recién creado y hacer clic en **"Editar"**.
   - Resaltar cómo los datos se cargan automáticamente en los campos del formulario y el botón cambia a *"Actualizar proyecto"*.
   - Modificar el estado: pasarlo de `Publicado` a `Borrador`.
   - Clic en **"Actualizar proyecto"**.
   - Ir a `index.html`, recargar la página: demostrar que el proyecto **ya no figura** en la vista pública porque el endpoint filtra exclusivamente `estado=publicado`. En el admin sigue visible con la etiqueta `○ Borrador`.

4. **Eliminar (Baja de proyecto):**
   - En `admin.html`, hacer clic en **"Eliminar"** sobre el proyecto creado.
   - Mostrar el cuadro de diálogo de confirmación (`confirm()`).
   - Al aceptar, se envía un `DELETE /api/proyectos/:id` (código HTTP 204) y el elemento desaparece de la lista.

5. **Demostración de Persistencia (La prueba de fuego):**
   - Ir a la terminal donde corre el backend y detener el servidor con `Ctrl + C`.
   - Volver a iniciarlo con `npm run dev`.
   - Recargar la página (tanto `index.html` como `admin.html`) y demostrar que los datos **sobrevivieron intactos al reinicio del servidor**, ya que residen en el archivo físico `data/portfolio.db` de SQLite y no en la memoria RAM.

---

## 2. Recorrido técnico del flujo de datos (De punta a punta)

Explicar el ciclo de vida de una petición (ejemplo: creación o consulta):

1. **Frontend (Disparador):**  
   El usuario interactúa con la interfaz (ej. clic en guardar en `admin.html` o carga de `index.html`). La función correspondiente en `frontend/js/api.js` ejecuta un `fetch()` asíncrono enviando la petición HTTP con cabecera `Content-Type: application/json` y el cuerpo serializado.

2. **Middleware y Enrutamiento (Express):**  
   La solicitud llega al servidor Express (`backend/src/app.ts`). El middleware `cors()` valida que el origen sea seguro (`FRONTEND_ORIGIN`), y `express.json()` parsea el cuerpo de la petición colocándolo en `req.body`. El enrutador `proyectos.routes.ts` captura la ruta según el método HTTP (`GET`, `POST`, `PUT`, `DELETE`).

3. **Validación de Negocio:**  
   Antes de tocar la base de datos, interviene `validators/proyecto.validator.ts`. Se verifica que los tipos, longitudes mínimas/máximas y formatos sean correctos (ej. estado válido, URL válida, texto no vacío). Si algo falla, se interrumpe el flujo y responde `400 Bad Request` con el detalle de errores.

4. **Persistencia (Capa de Repositorio y SQLite):**  
   Si los datos son válidos, se delega al repositorio (`proyectos.repository.ts`). Este ejecuta una consulta SQL preparada (`db.prepare(...)`) con **parámetros vinculados** (evitando inyecciones SQL). En las inserciones se convierte el array de tecnologías a string JSON para almacenarlo en la columna `TEXT`. El motor `better-sqlite3` escribe el cambio en el archivo `data/portfolio.db`.

5. **Respuesta y Renderizado en el DOM:**  
   La base de datos devuelve el resultado (o el ID generado). El backend transforma la fila de formato base de datos (`snake_case`) a la interfaz de TypeScript (`camelCase`), deserializa el JSON de tecnologías a array de strings y responde con el código de estado correspondiente (`200 OK`, `201 Created` o `204 No Content`). El frontend recibe la promesa resuelta en formato JSON y actualiza el árbol DOM utilizando `document.createElement()` y `textContent` (sin vulnerabilidades de `innerHTML`).

---

## 3. Justificación de la Base de Datos: ¿Por qué SQLite?

- **Estructura fija y relacional:** Cada proyecto cuenta con atributos estandarizados y bien definidos (`id`, `nombre`, `descripcion`, `tecnologias`, `estado`, etc.). No hay necesidad de esquemas polimórficos o dinámicos.
- **Simplicidad arquitectónica:** SQLite es una base de datos embebida (*serverless*). Guarda la base completa en un único archivo binario local (`portfolio.db`), evitando la sobrecarga de instalar, levantar y autenticar demonios de bases de datos como MySQL o PostgreSQL para un portfolio personal.
- **Persistencia garantizada:** A diferencia de almacenar datos en un objeto en memoria (`arrays` de JS) que se reinician al apagar Node.js, SQLite implementa transacciones ACID reales con almacenamiento persistente en disco.
- **¿Cuándo convendría una No Relacional (ej. MongoDB)?:** Si los proyectos tuvieran esquemas heterogéneos y cambiantes (por ejemplo, algunos con galerías de 20 fotos, otros con métricas de ventas, otros con bloques de código anidados sin estructura fija), o en arquitecturas distribuidas con escalamiento horizontal masivo.

---

## 4. Ventajas del Tipado Estático y TypeScript en este proyecto

- **Prevención temprana de errores:** TypeScript valida los tipos en tiempo de compilación. Si por error en el código tipamos `estado: 'eliminado'` o `proyecto.nomre`, el compilador detiene la ejecución inmediatamente, evitando bugs en tiempo de ejecución.
- **Contratos de datos claros (Modelado):** La interfaz `Proyecto` y el tipo unión `EstadoPublicacion = 'publicado' | 'borrador'` actúan como una especificación formal de nuestro dominio.
- **Refactorización confiable y autocompletado:** El entorno de desarrollo (VS Code) ofrece IntelliSense exacto sobre cada propiedad de un proyecto. Cambiar el nombre de una propiedad en la interfaz marca al instante todos los archivos donde debe corregirse.
- **Diferencia clave con JS:** JavaScript tiene tipado dinámico y débil (los tipos se deducen en runtime y pueden mutar libremente). TypeScript añade una capa de análisis estático estricto por encima de JavaScript, requiriendo un paso de compilación (`tsc`) que elimina los tipos y produce JS estándar ejecutable por cualquier runtime de Node.js.

---

## 5. Preguntas probables de la docente y respuestas recomendadas

1. **¿Por qué separaron el proyecto en carpetas `frontend/` y `backend/`?**  
   *Respuesta:* Para respetar el principio de separación de responsabilidades y permitir que cada parte tenga su propio ciclo de vida, dependencias y tecnologías (el backend utiliza Node.js, TypeScript y npm, mientras que el frontend son archivos estáticos HTML/CSS/JS consumibles por cualquier cliente o servidor web).

2. **¿Qué sucede si el backend está apagado y un usuario entra al portfolio?**  
   *Respuesta:* El frontend captura el error de red en el bloque `catch` de `cargarProyectos()` y muestra un mensaje accesible en `#estado-proyectos` ("No se pudo conectar con el servidor..."). El resto del sitio (modo oscuro, menú móvil, filtros de tecnologías y formulario de contacto) sigue funcionando perfectamente sin romperse.

3. **¿Cómo evitaron ataques de inyección SQL en el backend?**  
   *Respuesta:* Usando consultas parametrizadas con `better-sqlite3` mediante sentencias preparadas (`db.prepare(...)` con `@parametro` o `?`). Nunca concatenamos cadenas de texto directamente dentro de las sentencias SQL.

4. **¿Por qué guardaron las tecnologías como una cadena JSON en SQLite en vez de crear otra tabla?**  
   *Respuesta:* Para mantener la arquitectura simple y acorde a la consigna. Al ser un listado simple de etiquetas que siempre se leen y escriben en conjunto con el proyecto, serializarlas como JSON en una columna `TEXT` es eficiente y reduce la complejidad sin sacrificar integridad.

5. **¿Qué es CORS y por qué fue necesario configurarlo?**  
   *Respuesta:* CORS (*Cross-Origin Resource Sharing*) es una política de seguridad de los navegadores que bloquea peticiones HTTP asíncronas entre orígenes distintos (por ejemplo, el frontend en el puerto 5500 y el backend en el puerto 3000). Lo configuramos con el middleware `cors` en Express permitiendo explícitamente los orígenes definidos en el archivo `.env`.

6. **¿Por qué el archivo `.env` no se sube a GitHub?**  
   *Respuesta:* Porque contiene configuraciones del entorno local y eventualmente credenciales sensibles o claves privadas. Subirlo al repositorio público compromete la seguridad. En su lugar, se versiona un archivo plantilla `.env.example` con valores de muestra.

7. **¿Por qué en el frontend usaron `createElement` y `textContent` en vez de `innerHTML` al renderizar los proyectos?**  
   *Respuesta:* Por seguridad (prevención de ataques XSS o Cross-Site Scripting). Si un atacante guarda código malicioso en el nombre o descripción de un proyecto, `innerHTML` lo ejecutaría en el navegador de los visitantes, mientras que `textContent` lo trata estrictamente como texto plano.

8. **¿Cuál es la diferencia entre los métodos HTTP PUT y PATCH?**  
   *Respuesta:* `PUT` reemplaza completamente la entidad con los datos nuevos que se envían en el cuerpo de la petición (requiere todos los campos obligatorios), mientras que `PATCH` se utiliza para actualizaciones parciales (modificar uno o dos campos sin enviar el resto). En nuestro CRUD implementamos `PUT` para actualizar el proyecto completo.
