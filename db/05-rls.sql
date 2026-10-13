\set ON_ERROR_STOP on

ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_token ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarea ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocurrencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE nota_ocurrencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_ocurrencia ENABLE ROW LEVEL SECURITY;

CREATE POLICY usuario_select ON usuario
  FOR SELECT TO rutina_usr USING (true);
CREATE POLICY usuario_insert ON usuario
  FOR INSERT TO rutina_usr WITH CHECK (true);
CREATE POLICY usuario_update ON usuario
  FOR UPDATE TO rutina_usr
  USING (id = public.uid())
  WITH CHECK (id = public.uid());

CREATE POLICY refresh_token_select ON refresh_token
  FOR SELECT TO rutina_usr USING (true);
CREATE POLICY refresh_token_insert ON refresh_token
  FOR INSERT TO rutina_usr WITH CHECK (usuario_id = public.uid());
CREATE POLICY refresh_token_delete ON refresh_token
  FOR DELETE TO rutina_usr USING (usuario_id = public.uid());

CREATE POLICY tarea_select ON tarea
  FOR SELECT TO rutina_usr USING (usuario_id = public.uid());
CREATE POLICY tarea_insert ON tarea
  FOR INSERT TO rutina_usr WITH CHECK (usuario_id = public.uid());
CREATE POLICY tarea_update ON tarea
  FOR UPDATE TO rutina_usr
  USING (usuario_id = public.uid())
  WITH CHECK (usuario_id = public.uid());

CREATE POLICY ocurrencia_select ON ocurrencia
  FOR SELECT TO rutina_usr
  USING (EXISTS (
    SELECT 1 FROM public.tarea AS t
    WHERE t.id = ocurrencia.tarea_id
      AND t.usuario_id = public.uid()
  ));
CREATE POLICY ocurrencia_insert ON ocurrencia
  FOR INSERT TO rutina_usr
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tarea AS t
    WHERE t.id = ocurrencia.tarea_id
      AND t.usuario_id = public.uid()
  ));
CREATE POLICY ocurrencia_update ON ocurrencia
  FOR UPDATE TO rutina_usr
  USING (EXISTS (
    SELECT 1 FROM public.tarea AS t
    WHERE t.id = ocurrencia.tarea_id
      AND t.usuario_id = public.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tarea AS t
    WHERE t.id = ocurrencia.tarea_id
      AND t.usuario_id = public.uid()
  ));

CREATE POLICY nota_ocurrencia_select ON nota_ocurrencia
  FOR SELECT TO rutina_usr
  USING (EXISTS (
    SELECT 1
    FROM public.ocurrencia AS o
    JOIN public.tarea AS t ON t.id = o.tarea_id
    WHERE o.id = nota_ocurrencia.ocurrencia_id
      AND t.usuario_id = public.uid()
  ));
CREATE POLICY nota_ocurrencia_insert ON nota_ocurrencia
  FOR INSERT TO rutina_usr
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.ocurrencia AS o
    JOIN public.tarea AS t ON t.id = o.tarea_id
    WHERE o.id = nota_ocurrencia.ocurrencia_id
      AND t.usuario_id = public.uid()
  ));
CREATE POLICY nota_ocurrencia_update ON nota_ocurrencia
  FOR UPDATE TO rutina_usr
  USING (EXISTS (
    SELECT 1
    FROM public.ocurrencia AS o
    JOIN public.tarea AS t ON t.id = o.tarea_id
    WHERE o.id = nota_ocurrencia.ocurrencia_id
      AND t.usuario_id = public.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.ocurrencia AS o
    JOIN public.tarea AS t ON t.id = o.tarea_id
    WHERE o.id = nota_ocurrencia.ocurrencia_id
      AND t.usuario_id = public.uid()
  ));

CREATE POLICY lista_ocurrencia_select ON lista_ocurrencia
  FOR SELECT TO rutina_usr
  USING (EXISTS (
    SELECT 1
    FROM public.ocurrencia AS o
    JOIN public.tarea AS t ON t.id = o.tarea_id
    WHERE o.id = lista_ocurrencia.ocurrencia_id
      AND t.usuario_id = public.uid()
  ));
CREATE POLICY lista_ocurrencia_insert ON lista_ocurrencia
  FOR INSERT TO rutina_usr
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.ocurrencia AS o
    JOIN public.tarea AS t ON t.id = o.tarea_id
    WHERE o.id = lista_ocurrencia.ocurrencia_id
      AND t.usuario_id = public.uid()
  ));
CREATE POLICY lista_ocurrencia_update ON lista_ocurrencia
  FOR UPDATE TO rutina_usr
  USING (EXISTS (
    SELECT 1
    FROM public.ocurrencia AS o
    JOIN public.tarea AS t ON t.id = o.tarea_id
    WHERE o.id = lista_ocurrencia.ocurrencia_id
      AND t.usuario_id = public.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1
    FROM public.ocurrencia AS o
    JOIN public.tarea AS t ON t.id = o.tarea_id
    WHERE o.id = lista_ocurrencia.ocurrencia_id
      AND t.usuario_id = public.uid()
  ));
