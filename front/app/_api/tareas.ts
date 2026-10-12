import { api } from "./client";

export type Ocurrencia = {
  id: string;
  descripcion: string | null;
  fecha_ejecucion: string;
  estado: "completada" | "cancelada" | "pospuesta" | null;
};

export type Tarea = {
  id: string;
  nombre: string;
  descripcion: string | null;
  es_mensual: boolean;
  es_unica: boolean;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  hora_inicio: string | null;
  hora_fin: string | null;
  recurrencia: string;
  ocurrencias: Ocurrencia[];
};

export type TareaData = Omit<Tarea, "id" | "ocurrencias">;

export async function crearTarea(jwt: string, data: TareaData): Promise<{ id: string }> {
  return api
    .post("tareas/crear", {
      json: data,
      headers: { Authorization: `Bearer ${jwt}` },
    })
    .json<{ id: string }>();
}

export async function modificarTarea(
  jwt: string,
  data: TareaData & { id: string; activo: boolean },
): Promise<boolean> {
  return api
    .post("tareas/modificar", {
      json: data,
      headers: { Authorization: `Bearer ${jwt}` },
    })
    .json<boolean>();
}

export async function listarFecha(jwt: string, fecha: string): Promise<Tarea[]> {
  return api
    .post("tareas/listar_fecha", {
      json: { fecha },
      headers: { Authorization: `Bearer ${jwt}` },
    })
    .json<Tarea[]>();
}
