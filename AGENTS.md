# AGENTS.md

## Propósito

Este repositorio contiene todo el proyecto `Rutinas`, un pequeño sistema que funcione como agenda y verificador de tareas diarias/mensuales.

Se incluyen los scripts de base de datos en PosgreSQL, backend, frontend y las configuraciones de contenedores.

## Fuente de la verdad

Las especificaciones ubicadas dentro del directorio `specs/` y la infraestructura definida en `docs/` son la fuente de la verdad para la arquitectura y el comportamiento esperado del proyecto.

El agente debe priorizar las especificaciones aceptadas sobre cualquier implementación existente que no coincida con ellas.

El agente no debe modificar una especificación para hacerla coincidir con una implementación existente.

## Arquitectura

La arquitectura general del repositorio está definida en:

`docs/infraestructura.md`

Esta especificación define:

- La organización de los proyectos.
- La separación entre cada ambiente.
- El alcance de cada ambiente del proyecto.
- Las responsabilidades de cada ambiente del proyecto.

Antes de realizar cambios estructurales en el repositorio, el agente debe consultar esta especificación.

## Flujo de trabajo

Cuando el usuario solicite implementar una especificación, el agente deberá:

- Leer AGENTS.md (este archivo)
- Leer docs/infraestructura.md
- Leer la especificación correspondiente al proyecto correspondiente
- Validar que la especificación se encuentre en estado `Aceptada`, de lo contrario, preguntar al usuario si se debe proceder con la implementación.
- Identificar los archivos afectados.
- Revisar dependencias entre los archivos.
- Implementar los cambios necesarios.
- Verificar que la implementación coincida con la especificación.
- Informar al usuario de los archivos modificados y de cualquier consideración relevante.

El agente no deberá asumir que una nueva especificación debe implementarse automáticamente.
La existencia o modificación de una especificación no constituye por sí misma una orden para modificar la implementación.

## Seguridad

No deberán almacenarse en el repositorio:

- Contraseñas reales
- Secretos
- Tokens
- Credenciales de producción
- Variables sensibles

Los valores utilizados durante instalaciones locales o de desarrollo deberán utilizar mecanismos de configuración externa cuando corresponda.
Las credenciales temporales únicamente deberán utilizarse cuando estén explicitamente definidas por la especificación.

## Cambios destructivos

El agente deberá solicitar confirmación antes de realizar cambios destructivos que puedan provocar pérdida de datos.

Esto incluye, entre otros:

- DROP DATABASE
- DROP TABLE
- Eliminaciones masivas de datos.
- Cambios incompatibles con datos existentes.

Los cambios necesarios para implementar una especificación deberán preferir modificaciones seguras y compatibles cuando sea posible.

## Verificación

Después de implementar una especificación, el agente deberá verificar:

- Que los archivos sean sintácticamente válidos conforme a su lenguaje.
- Que las dependencias sean correcctas


El agente deberá informar cualquier parte que no haya podido verificar.

## Alcance

El agente deberá limitar sus cambios al alcance de la tarea solicitada.
No deberá modificar:

- Configuración externa al repositorio
- Archivos de almacenamiento de claves privadas o variables sensibles (.env, .envrc, entre otros)
- Arquitectura general

salvo que el usuario lo solicite explícitamente.