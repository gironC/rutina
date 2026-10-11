\set ON_ERROR_STOP on

CREATE TABLE IF NOT EXISTS public.usuario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  correo text,
  nombres text,
  apellidos text,
  telefono text,
  pass text,
  activo boolean DEFAULT true,
  creacion timestamptz DEFAULT now(),
  modificacion timestamptz
);

CREATE TABLE IF NOT EXISTS public.refresh_token (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES public.usuario (id),
  hash text,
  creacion timestamptz DEFAULT now(),
  vencimiento timestamptz
);

CREATE TABLE IF NOT EXISTS public.tarea (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES public.usuario (id),
  nombre text,
  descripcion text,
  es_mensual boolean,
  es_unica boolean,
  fecha_ejecucion date,
  hora_inicio time,
  hora_fin time,
  recurrencia text,
  activo boolean DEFAULT true,
  creacion timestamptz DEFAULT now(),
  modificacion timestamptz
);

DO $create_estado_ocurrencia$
BEGIN
  CREATE TYPE public.estado_ocurrencia AS ENUM ('completada', 'cancelada', 'pospuesta');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$create_estado_ocurrencia$;

CREATE TABLE IF NOT EXISTS public.ocurrencia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarea_id uuid REFERENCES public.tarea (id),
  descripcion text,
  estado public.estado_ocurrencia,
  creacion timestamptz DEFAULT now(),
  modificacion timestamptz
);

CREATE TABLE IF NOT EXISTS public.lista_ocurrencia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ocurrencia_id uuid REFERENCES public.ocurrencia (id),
  nombre text,
  completada boolean DEFAULT false,
  activo boolean DEFAULT true,
  creacion timestamptz DEFAULT now(),
  modificacion timestamptz
);
