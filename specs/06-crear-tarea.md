# Crear Tarea

## Estado

En desarrollo

## Definición

Crear la vista para integrar nuevas tareas en el proyecto.

## Puntos importantes

* TODAS las llamadas al backend utilizan Ky.
* Para cada módulo creado en el backend se crea un archivo .ts en `app/_api` con las rutas de ese módulo específico.
* Para los mensajes de error siempre utilizar el toast de sonner mostrando el mensaje recibido por el API.

## Implementación

Modificar el page del componente `dashboard/crear`

* Mientras se hagan las comprobaciones, muestra un loading:
  * Se renueva el JWT llamando al backend a la ruta `auth/refresh`. Si la renovación falla, se llama al backend a la ruta `auth/logout`, se elimina el JWT y los datos del usuario de local storage y se redirecciona a `login`.

* Al finalizar las comprobaciones, se muestra el template contenedor y como children:
  * Un formulario renderizado en 3 secciones, cada sección en un card con borde base-300, sin shadow para crear una nueva tarea.
  * Sección 1:
    * Título `Datos generales`
    * Un componente Input tipo text, icono ClipboardCheck, título Nombre.
    * Un componente Input tipo text, icono Logs, título Descripción.
  * Sección 2:
    * Título `Planificación`
    * Un componente Datepicker, título Fecha de inicio.
    * Un componente Datepicker, título Fecha de finalización (opcional).
    * Un join de checkboxes de tipo btn, con un título con el mismo estilo del componente Input. El título es `Si quieres que sea una tarea repetitiva, marca los días que se repite la tarea`. Los valores de cada checkbox son `L`, `M`, `X`, `J`, `V`, `S` y `D`.

  * Sección 3:
    * Título `Horario(opcional) `
    * Un switch con el texto `Definir un horario para esta tarea`.
    * Si el switch está activo se muestran 2 componentes Input, tipo time, ícono clock, uno con título Hora de inicio y el otro con título Hora de finalización.

  * Al final del formulario se muestra:
    * Un texto en negrita `Tipo de tarea <tipo>`. Debajo, una descripción del tipo de tarea. Se detalla a continuación:
      * Si no se selecciona ningún dia para repetir y la fecha de finalización no se selecciona o es la misma que la fecha de inicio, la tarea es de tipo `Única`. Este tipo de tareas sólo se ejecutan una vez.
      * Si se especifa fecha de finalización diferente a fecha de inicio pero no se selecciona ningún dia para repetir, la tarea es de tipo `Flexible`. Este tipo de tareas se ejecutan una vez en un periodo definido, puede ser cualquier día dentro de ese rango.
      * Si se especifica fecha de finalización diferente a fecha de inicio y se selecciona al menos un día de la semana, el tipo de tarea es `Repetitiva`. Este tipo de tareas se ejecuta cada día seleccionado.

  * Se muestra un botón para enviar el formulario con el texto `Crear tarea`.
  * El botón toma los datos y los envía al backend a la ruta `tareas/crear`.