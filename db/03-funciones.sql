\set ON_ERROR_STOP on

CREATE OR REPLACE FUNCTION public.uid()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_context text;
  v_usuario_id uuid;
BEGIN
  v_context := pg_catalog.current_setting('app.usuario_id', true);

  IF v_context IS NULL OR pg_catalog.btrim(v_context) = '' THEN
    RETURN NULL;
  END IF;

  BEGIN
    v_usuario_id := v_context::uuid;
  EXCEPTION
    WHEN invalid_text_representation THEN
      RETURN NULL;
  END;

  IF EXISTS (
    SELECT 1
    FROM public.usuario AS u
    WHERE u.id = v_usuario_id
      AND u.activo IS TRUE
  ) THEN
    RETURN v_usuario_id;
  END IF;

  RETURN NULL;
END
$function$;
