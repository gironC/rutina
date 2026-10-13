#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
container_name="saas-postgres"

run_sql() {
  local database_name="$1"
  local script_name="$2"
  local script_path="${script_dir}/${script_name}"

  echo "Ejecutando ${script_name} en ${container_name}/${database_name}..."
  docker exec -i "${container_name}" psql \
    --username postgres \
    --dbname "${database_name}" \
    --set ON_ERROR_STOP=1 < "${script_path}"
  echo "${script_name} finalizado correctamente."
}

run_sql postgres 01-init.sql
run_sql rutina 02-tablas.sql
run_sql rutina 03-funciones.sql
run_sql rutina 04-roles.sql
run_sql rutina 05-rls.sql

echo "Todos los scripts de base de datos finalizaron correctamente."
