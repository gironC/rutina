\set ON_ERROR_STOP on

CREATE TYPE tipo_tarea AS ENUM ('unica', 'recurrente', 'flexible');
CREATE TYPE estado_ocurrencia AS ENUM ('completada', 'cancelada', 'pospuesta');

CREATE TABLE usuario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  correo text NOT NULL,
  nombres text NOT NULL,
  apellidos text NOT NULL,
  pass_hash text NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  creacion timestamptz NOT NULL DEFAULT now(),
  modificacion timestamptz
);

CREATE TABLE refresh_token (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES usuario(id),
  hash text NOT NULL,
  creacion timestamptz NOT NULL DEFAULT now(),
  vencimiento timestamptz NOT NULL
);

CREATE TABLE tarea (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES usuario(id),
  nombre text NOT NULL,
  descripcion text NOT NULL,
  tipo tipo_tarea NOT NULL,
  hora_inicio time,
  hora_fin time,
  fecha_inicio date NOT NULL,
  fecha_fin date,
  recurrencia text NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  creacion timestamptz NOT NULL DEFAULT now(),
  modificacion timestamptz
);

CREATE TABLE ocurrencia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarea_id uuid NOT NULL REFERENCES tarea(id),
  estado estado_ocurrencia NOT NULL,
  fecha_ejecucion date NOT NULL,
  creacion timestamptz NOT NULL DEFAULT now(),
  modificacion timestamptz
);

CREATE TABLE nota_ocurrencia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ocurrencia_id uuid NOT NULL REFERENCES ocurrencia(id),
  nota text NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  creacion timestamptz NOT NULL DEFAULT now(),
  modificacion timestamptz
);

CREATE TABLE lista_ocurrencia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ocurrencia_id uuid NOT NULL REFERENCES ocurrencia(id),
  nombre text NOT NULL,
  completada boolean NOT NULL DEFAULT false,
  activo boolean NOT NULL DEFAULT true,
  creacion timestamptz NOT NULL DEFAULT now(),
  modificacion timestamptz
);
