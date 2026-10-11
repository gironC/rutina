#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
CONTAINER_NAME="saas-postgres"
DB_ADMIN_USER="postgres"

run_sql() {
  local database="$1"
  local file="$2"

  printf '\n==> Ejecutando %s en la base %s\n' "$file" "$database"
  docker exec -i \
    "$CONTAINER_NAME" \
    psql -X -v ON_ERROR_STOP=1 -U "$DB_ADMIN_USER" -d "$database" \
    < "$SCRIPT_DIR/$file"
}

run_sql postgres 01-init.sql

for file in \
  02-tablas.sql \
  03-funciones.sql \
  04-roles.sql \
  05-rls.sql \
  06-datos.sql
do
  run_sql rutina "$file"
done

printf '\n==> Todos los scripts de base de datos finalizaron correctamente.\n'
