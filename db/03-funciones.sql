\set ON_ERROR_STOP on

CREATE OR REPLACE FUNCTION public.uid()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $function$
DECLARE
  usuario_id_contexto text;
  usuario_id_validado uuid;
BEGIN
  usuario_id_contexto := NULLIF(current_setting('app.usuario_id', true), '');

  IF usuario_id_contexto IS NULL THEN
    RETURN NULL;
  END IF;

  BEGIN
    usuario_id_validado := usuario_id_contexto::uuid;
  EXCEPTION WHEN invalid_text_representation THEN
    RETURN NULL;
  END;

  IF EXISTS (
    SELECT 1
    FROM public.usuario AS u
    WHERE u.id = usuario_id_validado
      AND u.activo = true
  ) THEN
    RETURN usuario_id_validado;
  END IF;

  RETURN NULL;
END;
$function$;
