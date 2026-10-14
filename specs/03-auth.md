# Auth

## Estado

Aceptada

## Definición

Crear las vistas de registro y login del proyecto.

## Puntos importantes

* TODAS las llamadas al backend utilizan Ky.
* Para cada módulo creado en el backend se crea un archivo .ts en `app/_api` con las rutas de ese módulo específico.
* Para los mensajes de error siempre utilizar el toast de sonner mostrando el mensaje recibido por el API.

## Implementación

Se crea el archivo para integrar el módulo auth del backend.

Se crea el componente `login` con su layout y page.

* El layout ocupa toda la pantalla, dejando los componentes al centro de la misma, con un padding de 4 en todos los bordes.
* El page contiene:
  * Un card que contiene:
    * 2 inputs utilizando el componente input.
      * Uno tipo text para ingresar el correo, con icono Mail.
      * Uno tipo password para ingresar la contraseña, con icono KeyRound.
    * Un botón con el texto `Iniciar sesión`, tipo primary.
    * El botón llama al backend a la ruta `auth/login` enviando correo y contraseña. Si el login es exitoso, guarda el JWT recibido en un registro de localStorage y el resto de los datos del usuario en otro registro del localStorage.
    * Se redirige a `/dashboard`.
  * Bajo el card:
    * Un botón tipo btn-link que redirige a `/registro` con el texto `¿No tienes cuenta? Regístrate aquí`.

Se crea el componente `registro` con su layout y page.

* El layout ocupa toda la pantalla, dejando los componentes al centro de la misma, con un padding de 4 en todos los bordes.
* El page contiene:
  * Un card que contiene:
    * 5 inputs utilizando el componente input:
      * Uno tipo text para ingresar el correo, con icono Mail.
      * Uno tipo text para ingresar nombres, con icono User.
      * Uno tipo text para ingresar apellidos, con icono User.
      * Uno tipo password para ingresar la contraseña, con icono KeyRound.
      * Uno tipo password para confirmar la contraseña, con icono KeyRound.
    * Un botón con el texto `Registrarse`, tipo primary.
    * Se debe validar que las contraseñas coincidan.
    * El botón llama al backend a la ruta `auth/registro` enviando correo, nombres, apellidos y contraseña. Si el registro es exitoso, llama al backend a la ruta `auth/login` enviando correo y contraseña. Si el login es exitoso, guarda el JWT recibido en un registro de localStorage y el resto de los datos del usuario en otro registro del localStorage.
    * Se redirige a `/dashboard`.
  * Bajo el card:
    * Un botón tipo btn-link que redirige a `/login` con el texto `¿Ya tienes usuario? Inicia sesión`.
