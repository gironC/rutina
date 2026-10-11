\set ON_ERROR_STOP on

ALTER TABLE public.usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refresh_token ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarea ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocurrencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lista_ocurrencia ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS usuario_consultar ON public.usuario;
CREATE POLICY usuario_consultar
  ON public.usuario FOR SELECT TO rutina_usr
  USING (true);

DROP POLICY IF EXISTS usuario_crear ON public.usuario;
CREATE POLICY usuario_crear
  ON public.usuario FOR INSERT TO rutina_usr
  WITH CHECK (true);

DROP POLICY IF EXISTS usuario_modificar_propio ON public.usuario;
CREATE POLICY usuario_modificar_propio
  ON public.usuario FOR UPDATE TO rutina_usr
  USING (id = public.uid())
  WITH CHECK (id = public.uid());

DROP POLICY IF EXISTS refresh_token_consultar ON public.refresh_token;
CREATE POLICY refresh_token_consultar
  ON public.refresh_token FOR SELECT TO rutina_usr
  USING (true);

DROP POLICY IF EXISTS refresh_token_crear_propio ON public.refresh_token;
CREATE POLICY refresh_token_crear_propio
  ON public.refresh_token FOR INSERT TO rutina_usr
  WITH CHECK (usuario_id = public.uid());

DROP POLICY IF EXISTS refresh_token_eliminar_propio ON public.refresh_token;
CREATE POLICY refresh_token_eliminar_propio
  ON public.refresh_token FOR DELETE TO rutina_usr
  USING (usuario_id = public.uid());

DROP POLICY IF EXISTS tarea_consultar_propia ON public.tarea;
CREATE POLICY tarea_consultar_propia
  ON public.tarea FOR SELECT TO rutina_usr
  USING (usuario_id = public.uid());

DROP POLICY IF EXISTS tarea_crear_propia ON public.tarea;
CREATE POLICY tarea_crear_propia
  ON public.tarea FOR INSERT TO rutina_usr
  WITH CHECK (usuario_id = public.uid());

DROP POLICY IF EXISTS tarea_modificar_propia ON public.tarea;
CREATE POLICY tarea_modificar_propia
  ON public.tarea FOR UPDATE TO rutina_usr
  USING (usuario_id = public.uid())
  WITH CHECK (usuario_id = public.uid());

DROP POLICY IF EXISTS ocurrencia_consultar_propia ON public.ocurrencia;
CREATE POLICY ocurrencia_consultar_propia
  ON public.ocurrencia FOR SELECT TO rutina_usr
  USING (
    EXISTS (
      SELECT 1
      FROM public.tarea AS t
      WHERE t.id = tarea_id
        AND t.usuario_id = public.uid()
    )
  );

DROP POLICY IF EXISTS ocurrencia_crear_propia ON public.ocurrencia;
CREATE POLICY ocurrencia_crear_propia
  ON public.ocurrencia FOR INSERT TO rutina_usr
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.tarea AS t
      WHERE t.id = tarea_id
        AND t.usuario_id = public.uid()
    )
  );

DROP POLICY IF EXISTS ocurrencia_modificar_propia ON public.ocurrencia;
CREATE POLICY ocurrencia_modificar_propia
  ON public.ocurrencia FOR UPDATE TO rutina_usr
  USING (
    EXISTS (
      SELECT 1
      FROM public.tarea AS t
      WHERE t.id = tarea_id
        AND t.usuario_id = public.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.tarea AS t
      WHERE t.id = tarea_id
        AND t.usuario_id = public.uid()
    )
  );

DROP POLICY IF EXISTS lista_ocurrencia_consultar_propia ON public.lista_ocurrencia;
CREATE POLICY lista_ocurrencia_consultar_propia
  ON public.lista_ocurrencia FOR SELECT TO rutina_usr
  USING (
    EXISTS (
      SELECT 1
      FROM public.ocurrencia AS o
      JOIN public.tarea AS t ON t.id = o.tarea_id
      WHERE o.id = ocurrencia_id
        AND t.usuario_id = public.uid()
    )
  );

DROP POLICY IF EXISTS lista_ocurrencia_crear_propia ON public.lista_ocurrencia;
CREATE POLICY lista_ocurrencia_crear_propia
  ON public.lista_ocurrencia FOR INSERT TO rutina_usr
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.ocurrencia AS o
      JOIN public.tarea AS t ON t.id = o.tarea_id
      WHERE o.id = ocurrencia_id
        AND t.usuario_id = public.uid()
    )
  );

DROP POLICY IF EXISTS lista_ocurrencia_modificar_propia ON public.lista_ocurrencia;
CREATE POLICY lista_ocurrencia_modificar_propia
  ON public.lista_ocurrencia FOR UPDATE TO rutina_usr
  USING (
    EXISTS (
      SELECT 1
      FROM public.ocurrencia AS o
      JOIN public.tarea AS t ON t.id = o.tarea_id
      WHERE o.id = ocurrencia_id
        AND t.usuario_id = public.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.ocurrencia AS o
      JOIN public.tarea AS t ON t.id = o.tarea_id
      WHERE o.id = ocurrencia_id
        AND t.usuario_id = public.uid()
    )
  );
