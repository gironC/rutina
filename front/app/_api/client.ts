import ky, { HTTPError } from "ky";

const apiUrl = (
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.rutina.kinova.click"
).replace(/\/+$/, "");

export const api = ky.create({
  baseUrl: `${apiUrl}/`,
  credentials: "include",
});

export async function getApiErrorMessage(error: unknown): Promise<string> {
  if (error instanceof HTTPError) {
    try {
      const body = await error.response.clone().json<{ message?: string }>();
      if (body.message) {
        return body.message;
      }
    } catch {
      // Use the generic message when the server response is not JSON.
    }
  }

  return "No fue posible completar la solicitud. Inténtalo de nuevo.";
}
