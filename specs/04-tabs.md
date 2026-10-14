# Tabs

## Estado

Aceptada

## Definición

Crear la estructura y componentes del proyecto.

## Puntos importantes

* TODAS las llamadas al backend utilizan Ky.
* Para cada módulo creado en el backend se crea un archivo .ts en `app/_api` con las rutas de ese módulo específico.
* Para los mensajes de error siempre utilizar el toast de sonner mostrando el mensaje recibido por el API.

## Implementación

El componente de dashboard y todos sus sub-componentes van a utilizar el componente `Template` para renderizarse, por lo que conviene crear un componente contenedor, con las siguientes características:
  * El listado de opciones en el sidepanel es: `Inicio` redireccionando a `/dashboard`, `Semana` redireccionando a `/dashboard/semana`, `Mes` redireccionando a `/dashboard/mes`, `Crear tarea` redireccionando a `/dashboard/crear`, `Perfil` redireccionando a `/dashboard/perfil` y `Cerrar sesion` que llama a una función que envía el id de usuario al backend en la ruta `auth/logout`, elimina el JWT de local storage y redirecciona a `/login`.

Se crea el componente `dashboard` con su layout y page.

* El layout ocupa todo el ancho de la pantalla, con un padding de 4 en todos los bordes.
* En el page:
  * Se muestra el template y una página de prueba

Se crean los componentes para `semana`, `mes`, `crear` y `perfil` dentro del componente `dashboard` con el page para cada uno.

* En el page:
  * Se muestra el template y una página de prueba.