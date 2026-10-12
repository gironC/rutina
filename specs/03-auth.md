# Auth

## Estado

Aceptada

## Definición

Crear el flujo de inicio de sesión del usuario.

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

Crear los archivos de rutas y servicios para auth en `src/modules`.

Las rutas se exportan y se registran en `app.ts` con el prefijo `auth/` para todas las rutas.

El archivo de rutas no debe tener lógica de negocio, toda la lógica vive en el archivo de servicios.

Dentro de los métodos a crear están los siguientes:

* registro
  * Tipo POST.
  * Sirve para crear un usuario.
  * Obtiene correo, contraseña, nombres, apellidos y teléfono en el body.
  * Encripta la contraseña para guardarla en el campo pass.
  * Crea un nuevo registro en la tabla usuario usando los valores correspondientes.
  * Retorna el id generado

* login
  * Tipo POST.
  * Sirve para autenticar un usuario.
  * Obtiene correo y contraseña en el body.
  * Busca un registro en la tabla usuario y utiliza bcrypt para comparar contraseñas.
  * Si el usuario es correcto se crea un uuid y se encripta con node:crypto. El uuid generado sin encriptar se guarda en la cookie `rutina_sesion`.
  * Toma el valor del id del usuario y lo envía al parámetro de contexto `app.usuario_id` de la base de datos. Al mismo tiempo se crea un registro en la tabla refresh_token usando el uuid encriptado como hash, la fecha de creación de hoy y la fecha de vencimiento sumandole la cantidad de días de la variable de entorno REFRESH_TOKEN_DAYS a la fecha de hoy.
  * Se crea un JWT adicionando el id del usuario en el campo `sub`.
  * La expiración del JWT se toma de la variable de entorno ACCESS_TOKEN_EXPIRES.
  * Se envía correo, nombres, apellidos, teléfono y el JWT como respuesta en formato JSON.

* refresh
  * Tipo POST.
  * No obtiene parámetros en el body.
  * Obtiene la cookie `rutina_sesion`. Si la cookie no existe retorna un error.
  * Se encripta el valor de la cookie con node:crypto y el valor encriptado se busca en el campo hash de la tabla refresh_token.
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
  * Se encripta el valor de la cookie con node:crypto y el valor encriptado se busca en el campo hash de la tabla refresh_token.
  * Si se encuentra el registro, se elimina el registro de base de datos.
  * Si no encuentra el registro, se omite el paso de eliminación de base de datos.
  * Se elimina la cookie.
  * Se retorna true.

Crear los archivos de rutas y servicios para usuario en `src/modules`.

Las rutas se exportan y se registran en `app.ts` con el prefijo `usuario/` para todas las rutas.

El archivo de rutas no debe tener lógica de negocio, toda la lógica vive en el archivo de servicios.

Dentro de los métodos a crear están los siguientes:

* perfil
  * Tipo GET.
  * Sirve para obtener información del usuario autenticado.
  * No obtiene parámetros en el body.
  * Obtiene el JWT y verifica que sea válido.
  * Toma el valor `sub` del JWT y lo envía al parámetro de contexto `app.usuario_id` de la base de datos. Al mismo tiempo consulta en la tabla usuario filtrando por el id de usuario obtenido en el valor `sub`.
  * Retorna el id, nombres, apellidos, teléfono y correo del usuario consultado.

### Frontend

Se crea el archivo para integrar el módulo auth del backend.

Se crea el componente `login` con su layout y page.

* El layout ocupa toda la pantalla, dejando los componentes al centro de la misma, con un padding de 4 en todos los bordes.
* El page contiene:
  * Un card que contiene:
    * 2 inputs utilizando el componente input.
      * Uno tipo text para ingresar el correo, con icono Mail.
      * Uno tipo password para ingresar la contraseña, con icono KeyRound.
    * Un botón con el texto `Iniciar sesión`, tipo primary.
    * El botón llama al backend a la ruta `auth/login` enviando correo y contraseña. Si el login es exitoso, guarda el JWT recibido en local storage y se redirige a `/dashboard`.
  * Bajo el card:
    * Un botón tipo btn-link que redirige a `/registro` con el texto `¿No tienes cuenta? Regístrate aquí`.

Se crea el componente `registro` con su layout y page.

* El layout ocupa toda la pantalla, dejando los componentes al centro de la misma, con un padding de 4 en todos los bordes.
* El page contiene:
  * Un card que contiene:
    * 6 inputs utilizando el componente input.
      * Uno tipo text para ingresar el correo, con icono Mail.
      * Uno tipo text para ingresar nombres, con icono User.
      * Uno tipo text para ingresar apellidos, con icono User.
      * Uno tipo text para ingresar teléfono, con icono Phone.
      * Uno tipo password para ingresar la contraseña, con icono KeyRound.
      * Uno tipo password para confirmar la contraseña, con icono KeyRound.
    * Un botón con el texto `Registrarse`, tipo primary.
    * Se debe validar que el teléfono sea válido, solo debe contener dígitos y ser 8.
    * Se debe validar que las contraseñas coincidan.
    * El botón llama al backend a la ruta `auth/registro` enviando correo, nombres, apellidos, teléfono y contraseña. Si el registro es exitoso, llama al backend a la ruta `auth/login` y se redirige a `/dashboard`.
  * Bajo el card:
    * Un botón tipo btn-link que redirige a `/login` con el texto `¿Ya tienes usuario? Inicia sesión`.
