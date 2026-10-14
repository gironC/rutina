import { postBackend } from "./api_client";

export type EstadoOcurrencia = "completada" | "cancelada" | "pospuesta";

export async function crearOcurrencia(datos: {
  tarea_id: string;
  estado: EstadoOcurrencia;
  fecha_ejecucion: string;
}): Promise<{ id: string }> {
  return postBackend<{ id: string }>("ocurrencias/crear", datos);
}

export async function modificarOcurrencia(datos: {
  id: string;
  estado: EstadoOcurrencia;
}): Promise<boolean> {
  return postBackend<boolean>("ocurrencias/modificar", datos);
}

export async function crearNotaOcurrencia(datos: {
  ocurrencia_id: string;
  nota: string;
}): Promise<{ id: string }> {
  return postBackend<{ id: string }>("ocurrencias/crear_nota", datos);
}

export async function modificarNotaOcurrencia(datos: {
  id: string;
  nota: string;
  activo: boolean;
}): Promise<boolean> {
  return postBackend<boolean>("ocurrencias/modificar_nota", datos);
}

export async function crearListaOcurrencia(datos: {
  ocurrencia_id: string;
  nombre: string;
}): Promise<{ id: string }> {
  return postBackend<{ id: string }>("ocurrencias/crear_lista", datos);
}

export async function modificarListaOcurrencia(datos: {
  id: string;
  nombre: string;
  completada: boolean;
  activo: boolean;
}): Promise<boolean> {
  return postBackend<boolean>("ocurrencias/modificar_lista", datos);
}
