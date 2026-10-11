# Creación de proyectos backend y frontend

## Estado

Aceptada

## Implementación

### Backend

Se inicializa un nuevo proyecto node utilizando pnpm versión 12.11.2.

Se adicionan los siguientes paquetes:

* fastify
* @fastify/jwt
* @fastify/cors
* @fastify/cookie
* @fastify/static
* @fastify/multipart
* bcrypt
* date-fns
* dotenv
* pg
* uuid

Se adicionan las dependencias de desarrollo:

* @types/bcrypt
* @types/node
* @types/pg
* nodemon
* ts-node
* tsx
* typescript

Se crean las carpetas y archivos generales, correspondientes al proyecto.

Las variables de entorno necesarias serán:

* CORS_DOMAINS: contiene el listado de los dominios definidos para CORS, separados por comas.
* JWT_SECRET: La key para los tokens JWT
* ACCESS_TOKEN_EXPIRES: El tiempo de vida del JWT, por defecot 24 horas
* REFRESH_TOKEN_DAYS: El tiempo de vida de un refresh token en días, por defecto 15
* COOKIE_DOMAIN: El dominio para las cookies, para producción .kinova.click
* PORT: El puerto donde se levantará el backend, por defecto 4000
* DB_HOST: El host de postgres, por defecto localhost
* DB_PORT: El puerto de postgres, por defecto 5432
* DB_USER: El usuario de postgres
* DB_PASSWORD: La contraseña del usuario de postgres
* DB_NAME: El nombre de la base de datos, por defecto rutina

En `src/config/` se definen los siguientes archivos:
* Un archivo para listar todas las variables de entorno y poder utilizarlas en el proyecto.
* Un archivo para inicializar un Pool de postgreSQL. Para los parámetros de conexión se utilizan los valores de las variables de entorno que inician con `DB_`.

En `src/middleware/` se define un archivo para verificar el JWT que se utiliza como middleware más adelante.

En `src/types` se crea un archivo para integrar el valor `sub` al payload del jwt.

Para la configuración de origin de los CORS en `app.ts` se toma el valor de la variable de entorno CORS_DOMAINS.

Para el registro de JWT en `app.ts` se utiliza el valor dela variable de entorno JWT_SECRET.

Para inicializar el proyecto se utiliza el valor de la variable de entorno PORT.

### Frontend

# Creación de proyecto frontend

Se inicializa un nuevo proyecto de NextJS con AppRouter, con la configuración por defecto.

La gestión de paquetes ser hace a través de pnpm 12.11.2

Después de la creación del proyecto de NextJS se adicionan los siguientes paquetes:

* date-fns
* dotenv
* ky
* lucide-react
* zustand
* sonner
* tailwind-animations

Se adicionan las dependencias de desarrollo:

* DaisyUI

Las variables de entorno necesarias serán:

* NEXT_PUBLIC_API_URL: Contiene la url para conectarse al backend, por defecto `https://api.rutina.kinova.click`
* PORT: El puerto en donde corre la aplicación, por defecto 3000

Los valores por defecto pueden ir en el .env.example ya que no representan ninguna vulnerabilidad.

En `app/globals.cs` se elimina todo el contenido y se deja únicamente el import de tailwindcss, tailwind-animations y el plugin de DaisyUI

En `app/layout.tsx` se deja únicamente el import de globals.css y del Toaster de sonner. Dentro del body, luego de {children} se inicializa el toaster con las propiedades expand y position en `top-center`.
