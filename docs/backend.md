# Infraestructura Backend

Se utiliza este archivo para las especificaciones generales de infraestructura del backend.

La estructura del proyecto debe ser algo parecido a:

```text
back/
├── Dockerfile
├── app.ts
├── server.ts
├── src/
│   ├── config/
│   ├── hooks/
│   ├── middleware/
│   ├── modules/
│   ├── services/
│   ├── types/
├── ...
```

El proyecto debe estar codificado en typescript.

El proyecto se levantará en el puerto 4000

## server.ts

Es la entrada a la aplicación, aquí se inicializa el servidor y se llama a `app.ts`.

## app.ts

Aquí se registran los middleware, cors, cookies, rutas y todo lo que necesite la aplicación.

## Dockerfile

Contiene el despliegue a docker del backend

## src/

Es la carpeta donde convive todo el código.

### config/

Almacena los archivos de configuración, generalmente variables, parámetros, instancias de base de datos, etc.

### hooks/

Contiene las funciones que se utilicen para hooks que puedan ser necesarios.

### middleware/

Contiene los middleware necesarios para las rutas que se creen.

### modules/

La parte central del código, aquí viven las rutas del proyecto por funcionalidad.

Por ejemplo, si quisieramos hacer la funcionalidad de autenticación se crean 2 archivos: `auth.service.ts` que contiene todas las funciones necesarias y `auth.routes.ts` que especifica las rutas del módulo sin lógica de negocio.

### services/

Aquí se almacenan las funciones que integren servicios externos, como servidores de correo, autenticación con terceros, etc.

### types/

Contiene los archivos necesarios para definir los tipos de typescript para las librerías que necesiten.

Por defecto, aquí se va a definir el type de `@fastify/jwt` para poder integrarle los payload necesarios.

## Reglas de programación

* Todas las variables y constantes que utilicen o envíen datos de postgres se nombran con snake_case.
* Todas las variables y constantes deben referenciar a los nombres de columnas/tablas de postgres a las que hagan referencia.
* Los nombres de las funcciones/métodos deben estar en camelCase
* Los nombres de los archivos deben estar en snake_case
* Cada url de ruta creada debe coincidir con el nombre de la función a la que hace referencia, pero traduciendo el nombre de camelCase a snake_case
* Por ejemplo, si la función es `editarUsuario` la ruta quedará como `/editar_usuario`.
