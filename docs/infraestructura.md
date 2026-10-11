# Arquitectura del ecosistema

## Contexto

El proyecto consiste en una aplicación web para la creación de agendas personales, administración de tareas y muestra de objetivos diarios y mensuales.

## Esctructura del proyecto

### PostgreSQL

Se utilizará el motor de postgreSQL 18 para la base de datos.

Todos los scripts pertinentes se almacenarán en la carpeta /db.

La instancia de postgreSQL está dockerizada en el contenedor de nombre saas-postgres, se puede acceder a través de localhost:5432 para pruebas.

### Backend

El backend está diseñado para crearse con Fastify, pnpm y las dependencias necesarias para su correcto funcionamiento.

El proyecto se mantiene en la carpeta back/

Para la infraestructura detallada del proyecto, leer `backend.md`

### Frontend

El frontend está diseñado para crearse con NextJS, pnpm y las dependencias necesarias para su correcto funcionamiento.

El proyecto se mantiene en la carpeta front/

Para la infraestructura detallada del proyecto, leer `frontend.md`

## Reglas de programación

### General

* Typescript por defecto no exige punto y coma, pero para ambos proyectos se debe de poner siempre que se pueda por buenas prácticas.