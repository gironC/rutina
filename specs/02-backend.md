# Backend

## Estado

En desarrollo

## Definición

Crear lo módulos de backend correspondientes.

## Puntos importantes

* Para todas las funciones utilizar try/catch.
* Si algo falla se deben devolver los errores correspondientes y un mensaje de error amigable para los usuarios.
* No enviar mensajes de error técnicos para mantener segura la base de datos.
* Los archivos de rutas no debe tener lógica de negocio, toda la lógica vive en los archivos de servicios.
* Para todos los métodos que validen JWT, se debe enviar el parámetro de contexto `app.usuario_id` con el valor de `sub` del JWT a todas las transacciones que se hagan en base de datos.

## Implementación

Crear los archivos de rutas y servicios para auth en `src/modules`.

Las rutas se exportan y se registran en `app.ts` con el prefijo `auth/` para todas las rutas.

Dentro de los métodos a crear están los siguientes:

* registro
  * Tipo POST.
  * Obtiene usuario, contraseña, nombres y apellidos en el body.
  * Encripta la contraseña con bcrypt para guardarla en el campo pass_hash.
  * Crea un nuevo registro en la tabla usuario usando los valores correspondientes.
  * Retorna el id generado.

* login
  * Tipo POST.
  * Obtiene usuario y contraseña en el body.
  * Busca un registro en la tabla usuario y utiliza bcrypt para comparar contraseñas.
  * Si el usuario es correcto se crea un uuid y se encripta con node:crypto usando como llave la variable de entorno `JWT_SECRET`. El uuid generado sin encriptar se guarda en la cookie `rutina_sesion`.
  * Toma el valor del id del usuario y lo envía al parámetro de contexto `app.usuario_id` de la base de datos.
  * Crea un registro en la tabla refresh_token usando el uuid encriptado como hash, la fecha de creación de hoy y la fecha de vencimiento sumandole la cantidad de días de la variable de entorno `REFRESH_TOKEN_DAYS` a la fecha de hoy.
  * Se crea un JWT adicionando el id del usuario en el campo `sub`.
  * La expiración del JWT se toma de la variable de entorno `ACCESS_TOKEN_EXPIRES`.
  * Se envía correo, nombres, apellidos y el JWT como respuesta en formato JSON.

* refresh
  * Tipo POST.
  * No obtiene parámetros en el body.
  * Obtiene la cookie `rutina_sesion`. Si la cookie no existe retorna un error.
  * Se encripta el valor de la cookie con node:crypto usando como llave la variable de entorno `JWT_SECRET` y el valor encriptado se busca en el campo hash de la tabla refresh_token.
  * Si el registro no existe se elimina la cookie y se retorna un error.
  * Si el registro encontrado tiene fecha de vencimiento mayor a la fecha de hoy, se elimina el registro de base de datos, se elimina la cookie y se retorna un error.
  * Si el registro encontrado tiene fecha de vencimiento menor a la fecha de hoy, toma el usuario_id del registro y busca en la tabla usuario el registro correspondiente al id.
  * Se crea un jwt adicionando el id del usuario en el campo `sub`.
  * La expiración del JWT se toma de la variable de entorno ACCESS_TOKEN_EXPIRES.
  * Se retorna el JWT como respuesta en formato JSON.

* logout
  * Tipo POST.
  * No obtiene parámetros en el body.
  * Obtiene la cookie `rutina_sesion`. Si la cookie no existe retorna un error.
  * Se encripta el valor de la cookie con node:crypto usando como llave la variable de entorno `JWT_SECRET` y el valor encriptado se busca en el campo hash de la tabla refresh_token.
  * Si se encuentra el registro, se elimina el registro de base de datos.
  * Si no encuentra el registro, se omite el paso de eliminación de base de datos.
  * Se elimina la cookie.
  * Se retorna true.

Crear los archivos de rutas y servicios para tareas en `src/modules`.

Las rutas se exportan y se registran en `app.ts` con el prefijo `tareas/` para todas las rutas.

Dentro de los métodos a crear están los siguientes:

* crear
  * Tipo POST
  * Obtiene nombre, descripcion, tipo, hora_inicio, hora_fin, fecha_inicio, fecha_fin y recurrencia en el body.
  * Obtiene el JWT y verifica que sea válido.
  * Crea el registro en la tabla tarea usando para usuario_id el valor de `sub` del `JWT`.
  * Retorna el id de registro creado.

* modificar
  * Tipo POST
  * Obtiene id, nombre, descripción, tipo, hora_inicio, hora_fin, fecha_inicio, fecha_fin, recurrencia y activo en el body.
  * Obtiene el JWT y verifica que sea válido.
  * Modifica el registro de la tabla tarea filtrando por el id recibido y dejando en el campo modificacion el valor de now().
  * Retorna true si la operación fue exitosa.

* detalle
  * Tipo POST
  * Obtiene id y fecha en el body.
  * Obtiene el JWT y verifica que sea válido.
  * Consulta el registro en la tabla tarea filtrando por el id recibido.
  * En la misma consulta, obtiene el primer registro de la tabla ocurrencia que pertenezca a la tarea del id recibido cuya fecha_ejecucion pertenezca a la fecha recibida.
  * En la misma consulta, obtiene los registros de la tabla nota_ocurrencia que pertenezcan a la ocurrencia encontrada y su valor activo sea true.
  * En la misma consulta, obtiene los registros de la tabla lista_ocurrencia que pertenezcan a la ocurrencia encontrada y su valor activo sea true.
  * Retorna la información del registro.

* listaFecha
  * Tipo POST
  * Obtiene fecha en el body.
  * Obtiene el JWT y verifica que sea válido.
  * Consulta los registros de la tabla tarea filtrando por la fecha recibida y que el valor activo sea true.
  * Los registros deben tener fecha_inicio mayor o igual a la fecha recibida.
  * Los registros deben tener fecha_fin null o fecha_fin menor o igual a la fecha recibida.
  * Para cada tarea se consulta el primer registro en la tabla ocurrencia que pertenezca a esa tarea cuya fecha_ejecucion sea la fecha recibida.
  * La consulta se debe dividir en 2 subconsultas: La primera filtrando las tareas de tipo `unica` y `recurrente`, la segunda filtrando las tareas de tipo `flexible`.
  * Retorna los 2 listados recibidos.

* listarRango
  * Tipo POST
  * Obtiene fecha_inicio y fecha_fin en el body.
  * Obtiene el JWT y verifica que sea válido.
  * Consulta los registros de la tabla tarea filtrando por las fechas recibidas y que el valor activo sea true.
  * Los registros deben tener fecha_inicio mayor o igual a la fecha_inicio recibida.
  * Los registros deben tener fecha_fin null o fecha_fin menor o igual a la fecha_fin recibida.
  * Para cada tarea se consultan los registros en la tabla ocurrencia que pertenezca a esa tarea cuya fecha_ejecucion sea mayor o igual a la fecha_inicio recibida y fecha_ejecucion sea menor o igual a la fecha_fin recibida.
  * La consulta se debe dividir en 2 subconsultas: La primera filtrando las tareas de tipo `unica` y `recurrente`, la segunda filtrando las tareas de tipo `flexible`.
  * Retorna los 2 listados recibidos.

Crear los archivos de rutas y servicios para ocurrencias en `src/modules`.

Las rutas se exportan y se registran en `app.ts` con el prefijo `ocurrencias/` para todas las rutas.

Dentro de los métodos a crear están los siguientes:

* crear
  * Tipo POST
  * Obtiene tarea_id, estado y fecha_ejecucion en el body.
  * Obtiene el JWT y verifica que sea válido.
  * Crea el registro en la tabla ocurrencia.
  * Retorna el id de registro creado.

* modificar
  * Tipo POST
  * Obtiene id y estado en el body.
  * Obtiene el JWT y verifica que sea válido.
  * Modifica el registro de la tabla ocurrencia filtrando por el id recibido y dejando en el campo modificacion el valor de now().
  * Retorna true si la operación fue exitosa.

* crearNota
  * Tipo POST
  * Obtiene ocurrencia_id y nota en el body.
  * Obtiene el JWT y verifica que sea válido.
  * Crea el registro en la tabla nota_ocurrencia.
  * Retorna el id de registro creado.

* modificarNota
  * Tipo POST
  * Obtiene id, nota y activo en el body.
  * Obtiene el JWT y verifica que sea válido.
  * Modifica el registro de la tabla nota_ocurrencia filtrando por el id recibido y dejando en el campo modificacion el valor de now().
  * Retorna true si la operación fue exitosa.

* crearLista
  * Tipo POST
  * Obtiene ocurrencia_id y nombre en el body.
  * Obtiene el JWT y verifica que sea válido.
  * Crea el registro en la tabla lista_ocurrencia.
  * Retorna el id de registro creado.

* modificarLista
  * Tipo POST
  * Obtiene id, nombre, completada y activo en el body.
  * Obtiene el JWT y verifica que sea válido.
  * Modifica el registro de la tabla lista_ocurrencia filtrando por el id recibido y dejando en el campo modificacion el valor de now().
  * Retorna true si la operación fue exitosa.