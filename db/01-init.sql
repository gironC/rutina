\set ON_ERROR_STOP on

DO $role$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rutina_usr') THEN
    CREATE ROLE rutina_usr LOGIN PASSWORD '';
  END IF;
END
$role$;

SELECT format('CREATE DATABASE %I', 'rutina')
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'rutina')
\gexec

\connect rutina

CREATE EXTENSION IF NOT EXISTS pgcrypto;
