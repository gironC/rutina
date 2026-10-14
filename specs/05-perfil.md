# Perfil

## Estado

Aceptada

## Definición

Crea el módulo de actualización del perfil del usuario en el frontend.

## Puntos importantes

* TODAS las llamadas al backend utilizan Ky.
* Para cada módulo creado en el backend se crea un archivo .ts en `app/_api` con las rutas de ese módulo específico.
* Para los mensajes de error siempre utilizar el toast de sonner mostrando el mensaje recibido por el API.

## Implementación

Modificar el page del componente `dashboard/perfil`

* Mientras se hagan las comprobaciones, muestra un loading:
  * Se renueva el JWT llamando al backend a la ruta `auth/refresh`. Si la renovación falla, se llama al backend a la ruta `auth/logout`, se elimina el JWT y los datos del usuario de local storage y se redirecciona a `login`.

* Al finalizar las comprobaciones, se muestra el template contenedor y como children:
  * Un formulario, sin estilo, únicamente los componentes, de la forma:
    * Un componente Input tipo text para modificar nombres, con icono User, título del input `nombres`. El componente debe tener el valor por defecto almacenado en localStorage.
    * Un componente Input tipo text para modificar apellidos, con icono User, título del input `apellidos`. El componente debe tener el valor por defecto almacenado en localStorage.
    * Un botón primary con el texto `Guardar cambios`
  * El formulario envía los datos modificados al backend a la ruta `auth/actualizar_perfil`.
  * Al finalizar, si la operación fue exitosa, se actualizan los datos del localStorage.
  * Se debe validar que los nombres y apellidos sean campos alfanuméricos, incluyendo tildes, y que no se acepten caracteres especiales.