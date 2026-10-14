# Infraestructura Backend

## Generalidades

Se utiliza este archivo para las especificaciones generales de infraestructura del frontend.

La estructura del proyecto, siguiendo la configuración por defecto de NextJS con AppRouter, debe ser algo parecido a:

```text
front/
├── Dockerfile
├── app.ts
├── server.ts
├── app/
│   ├── _api/
│   ├── auth/
│   ├── componentes/
│   ├── ...
├── public/
├── ...
```

El proyecto debe estar codificado en typescript.

El proyecto se levantará en el puerto 3000.

Para los estilos de la aplicación se utilizará tailwind y DaisyUI.

## Reglas de programación

* Todos los hooks de estado deben utilizar camelCase para sus nombres.
* La función de cambio del hook de estado debe coincidir con el nombre de su variable, anteponiendo el prefijo `set`.
  * Por ejemplo, si la variable es `horaLogin` la función de cambio es `setHoraLogin`.
* Para las variables que se utilicen en la comunicación con el backend, tanto de entrada como de salida, deben estar escritas en snake_case y deben coincidir con los valores que representan.
* El nombre de las carpetas por página debe escribirse en snake_case.
* Todas las funciones deben usar camelCase.
* Priorizar siempre componentes de DaisyUI para los estilos, seguido de las clases de tailwind.
* Evitar lo máximo posible el uso de estilos propios.
* Para todos los cards se utilizará shadow-md.
