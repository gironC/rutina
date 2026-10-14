import { postBackend } from "./api_client";

interface CredencialesBackend {
  usuario: string;
  contrasena: string;
}

interface RegistroBackend extends CredencialesBackend {
  nombres: string;
  apellidos: string;
}

export interface RespuestaAuth {
  correo: string;
  nombres: string;
  apellidos: string;
  jwt: string;
}

export interface DatosUsuarioLocal {
  correo: string;
  nombres: string;
  apellidos: string;
}

export const JWT_STORAGE_KEY = "jwt";
export const USER_DATA_STORAGE_KEY = "datos_usuario";

interface RespuestaRegistro {
  id: string;
}

interface DatosRegistro {
  correo: string;
  nombres: string;
  apellidos: string;
  contrasena: string;
}

interface DatosLogout {
  usuario_id: string;
}

export async function iniciarSesion(
  correo: string,
  contrasena: string,
): Promise<RespuestaAuth> {
  const datos_backend: CredencialesBackend = {
    usuario: correo,
    contrasena,
  };
  return postBackend<RespuestaAuth>("auth/login", datos_backend);
}

export async function registrarUsuario(datos: DatosRegistro): Promise<RespuestaRegistro> {
  const datos_backend: RegistroBackend = {
    usuario: datos.correo,
    nombres: datos.nombres,
    apellidos: datos.apellidos,
    contrasena: datos.contrasena,
  };
  return postBackend<RespuestaRegistro>("auth/registro", datos_backend);
}

export async function cerrarSesion(usuario_id: string): Promise<boolean> {
  const datos_backend: DatosLogout = { usuario_id };
  return postBackend<boolean>("auth/logout", datos_backend);
}

export async function renovarSesion(): Promise<{ jwt: string }> {
  return postBackend<{ jwt: string }>("auth/refresh");
}

export async function actualizarPerfil(datos: {
  nombres: string;
  apellidos: string;
}): Promise<boolean> {
  return postBackend<boolean>("auth/actualizar_perfil", datos);
}

export function guardarSesion(respuesta: RespuestaAuth): void {
  try {
    const { jwt, ...datos_usuario } = respuesta;
    window.localStorage.setItem(JWT_STORAGE_KEY, jwt);
    window.localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(datos_usuario));
  } catch {
    throw new Error("No fue posible guardar los datos de la sesión en este dispositivo.");
  }
}

export function obtenerUsuarioId(jwt: string): string {
  try {
    const segmento_payload = jwt.split(".")[1];
    if (!segmento_payload) {
      return "";
    }

    const payload_base64 = segmento_payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const paddingLength = (4 - payload_base64.length % 4) % 4;
    const payload_json = globalThis.atob(`${payload_base64}${"=".repeat(paddingLength)}`);
    const payload = JSON.parse(payload_json) as { sub?: unknown };
    return typeof payload.sub === "string" ? payload.sub : "";
  } catch {
    return "";
  }
}
