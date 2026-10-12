# Dashboard

## Estado

Aceptada

## Definición

Crear la página principal del proyecto.

## Puntos importantes

Backend:
* Para todas las funciones utilizar try/catch.
* Si algo falla se deben devolver los errores correspondientes y un mensaje de error amigable para los usuarios.
* No enviar mensajes de error técnicos para mantener segura la base de datos.

Frontend:
* TODAS las llamadas al backend utilizan Ky.
* Para cada módulo creado en el backend se crea un archivo .ts en `app/_api` con las rutas de ese módulo específico.
* Para los mensajes de error siempre utilizar el toast de sonner mostrando el mensaje recibido por el API.

## Implementación

### Backend

Crear los archivos de rutas y servicios para tareas en `src/modules`.

Las rutas se exportan y se registran en `app.ts` con el prefijo `tareas/` para todas las rutas.

El archivo de rutas no debe tener lógica de negocio, toda la lógica vive en el archivo de servicios.

Dentro de los métodos a crear están los siguientes:

* crear
  * Tipo POST.
  * Sirve para crear una tarea.
  * Obtiene nombre, descripcion, es_mensual, es_unica, fecha_inicio, fecha_fin, hora_inicio, hora_fin y recurrencia en el body.
  * Obtiene el JWT y verifica que sea válido.
  * Toma el valor `sub` del JWT y lo envía al parámetro de contexto `app.usuario_id` de la base de datos.
  * Si fecha_ejecucion, hora_inicio y hora_fin son nulos, se omiten en la inserción.
  * Crea un nuevo registro en la tabla tarea usando los valores correspondientes.
  * Retorna el id generado.

* modificar
  * Tipo POST.
  * Sirve para actualizar una tarea.
  * Obtiene id, nombre, descripcion, es_mensual, es_unica, fecha_inicio, fecha_fin, hora_inicio, hora_fin, recurrencia y activo en el body.
  * Obtiene el JWT y verifica que sea válido.
  * Toma el valor `sub` del JWT y lo envía al parámetro de contexto `app.usuario_id` de la base de datos.
  * Si fecha_ejecucion, hora_inicio y hora_fin son nulos, se omiten en la modificación.
  * Modifica el registro en la tabla tarea filtrando por el id recibido.
  * Retorna true si la operación es exitosa

* listarFecha
  * Tipo POST.
  * Sirve para listar las tareas con fecha de hoy.
  * Obtiene fecha en el body.
  * Obtiene el JWT y verifica que sea válido.
  * Toma el valor `sub` del JWT y lo envía al parámetro de contexto `app.usuario_id` de la base de datos.
  * Consulta a la tabla tarea todos los registros cuya fecha_inicio sea menor a la fecha recibida y la fecha fin sea null o sea mayor a la fecha recibida.
  * Por cada registro consulta todos los registros de la tabla ocurrencia cuya fecha_ejecucion sea la fecha recibida.
  * Retorna el listado de registros.

### Frontend

Se crea el archivo para integrar el módulo tareas del backend.

El componente de dashboard y todos sus sub-componentes van a utilizar el componente `Template` para renderizarse, por lo que conviene crear un componente contenedor, con las siguientes características:
  * El listado de opciones en el sidepanel es: `Inicio` redireccionando a `/dashboard`, `Crear tarea` redireccionando a `/dashboard/crear`, `Tareas` redireccionando a `/dashboard/tareas` y `Cerrar sesion` que llama a una función que envía el id de usuario al backend en la ruta `auth/logout`, elimina el JWT de local storage y redirecciona a `/login`.

Se crea el componente `dashboard` con su layout y page.

* El layout ocupa todo el ancho de la pantalla, con un padding de 4 en todos los bordes.
* En el page:
  * Mientras se hagan las comprobaciones, muestra un loading:
    * Se renueva el JWT llamando al backend a la ruta `auth/refresh`. Si la renovación falla, se llama al backend a la ruta `auth/logout`, se elimina el JWT de local storage y se redirecciona a `login`.
    * Se obtienen los datos del usuario llamando al backend a la ruta `usuario/perfil`.
    * Se obtiene el listado de tareas del día llamando al backend a la ruta `tareas/listarFecha` enviando la fecha de hoy.
    * Si alguna consulta falla, se llama al backend a la ruta `auth/logout`, se elimina el JWT de local storage y se redirecciona a `login`.

  * Al finalizar las comprobaciones, se muestra el template contenedor y como children:
    * Una lista utilizando el componente de daisyUI. En la lista se muestran los datos de las tareas obtenidas de la siguiente forma:
      * Si la tarea no tiene ocurrencias, se muestra el nombre y la descripción de la tarea y el estado pendiente
      * Si la tarea tiene ocurrencias, se toma la primera y se muestra la descripción y el estado de la ocurrencia.