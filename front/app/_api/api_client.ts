import ky, { isHTTPError } from "ky";

const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000")
  .replace(/\/+$/, "");

const api = ky.create({
  prefix: apiUrl,
  credentials: "include",
});

function errorDeApi(error: unknown): Error {
  try {
    if (isHTTPError(error)) {
      const respuesta = error.data;
      if (typeof respuesta === "object" && respuesta !== null) {
        const cuerpo = respuesta as Record<string, unknown>;
        if (typeof cuerpo.error === "string") {
          return new Error(cuerpo.error);
        }

        if (typeof cuerpo.message === "string") {
          return new Error(cuerpo.message);
        }
      }
    }

    return new Error("No fue posible comunicarse con el servidor. Intenta de nuevo.");
  } catch {
    return new Error("No fue posible completar la solicitud. Intenta de nuevo.");
  }
}

export async function postBackend<T>(ruta: string, datos?: unknown): Promise<T> {
  try {
    const jwt = typeof window === "undefined"
      ? null
      : window.localStorage.getItem("jwt");
    const headers = jwt ? { authorization: `Bearer ${jwt}` } : undefined;
    const request = datos === undefined
      ? api.post(ruta, { headers })
      : api.post(ruta, { json: datos, headers });
    return await request.json<T>();
  } catch (error) {
    throw errorDeApi(error);
  }
}
