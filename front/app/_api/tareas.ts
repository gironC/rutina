import { postBackend } from "./api_client";

export type TipoTarea = "unica" | "recurrente" | "flexible";

export interface DatosCrearTarea {
  nombre: string;
  descripcion: string;
  tipo: TipoTarea;
  hora_inicio?: string | null;
  hora_fin?: string | null;
  fecha_inicio: string;
  fecha_fin?: string | null;
  recurrencia: string;
}

export interface DatosModificarTarea extends DatosCrearTarea {
  id: string;
  activo: boolean;
}

export interface RespuestaTareas {
  tareas: unknown[];
  flexibles: unknown[];
}

export async function crearTarea(datos: DatosCrearTarea): Promise<{ id: string }> {
  return postBackend<{ id: string }>("tareas/crear", datos);
}

export async function modificarTarea(datos: DatosModificarTarea): Promise<boolean> {
  return postBackend<boolean>("tareas/modificar", datos);
}

export async function obtenerDetalleTarea(datos: {
  id: string;
  fecha: string;
}): Promise<unknown | null> {
  return postBackend<unknown | null>("tareas/detalle", datos);
}

export async function listarTareasFecha(fecha: string): Promise<RespuestaTareas> {
  return postBackend<RespuestaTareas>("tareas/lista_fecha", { fecha });
}

export async function listarTareasRango(datos: {
  fecha_inicio: string;
  fecha_fin: string;
}): Promise<RespuestaTareas> {
  return postBackend<RespuestaTareas>("tareas/listar_rango", datos);
}
