\set ON_ERROR_STOP on
-- Escribe manualmente la contraseña antes de ejecutar este script; no guardes el valor en el repositorio.
\set rutina_password ''

\echo 'Verificando el rol rutina_usr...'
SELECT format('CREATE ROLE rutina_usr WITH LOGIN PASSWORD %L', :'rutina_password')
WHERE NOT EXISTS (
  SELECT 1
  FROM pg_catalog.pg_roles
  WHERE rolname = 'rutina_usr'
)
\gexec

ALTER ROLE rutina_usr WITH LOGIN;

\echo 'Verificando la base de datos rutina...'
SELECT 'CREATE DATABASE rutina'
WHERE NOT EXISTS (
  SELECT 1
  FROM pg_catalog.pg_database
  WHERE datname = 'rutina'
)
\gexec

\connect rutina

\echo 'Habilitando pgcrypto...'
CREATE EXTENSION IF NOT EXISTS pgcrypto;
