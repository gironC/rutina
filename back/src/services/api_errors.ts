import type { FastifyReply } from "fastify";

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly clearSessionCookie = false,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function toApiError(error: unknown): ApiError {
  try {
    if (error instanceof ApiError) {
      return error;
    }

    if (typeof error === "object" && error !== null) {
      const candidate = error as { code?: unknown; statusCode?: unknown };
      if (typeof candidate.code === "string" && candidate.code.startsWith("FST_JWT")) {
        return new ApiError(401, "La sesión no es válida o ha vencido.");
      }

      if (candidate.statusCode === 401) {
        return new ApiError(401, "La sesión no es válida o ha vencido.");
      }

      if (candidate.code === "23505") {
        return new ApiError(409, "El registro ya existe.");
      }

      if (["23502", "23503", "23514", "22P02", "22007", "22008"].includes(String(candidate.code))) {
        return new ApiError(400, "Los datos enviados no son válidos.");
      }
    }

    return new ApiError(500, "No fue posible completar la solicitud.");
  } catch {
    return new ApiError(500, "No fue posible completar la solicitud.");
  }
}

export function sendApiError(reply: FastifyReply, error: unknown): FastifyReply {
  try {
    const api_error = toApiError(error);
    return reply.code(api_error.statusCode).send({ error: api_error.message });
  } catch {
    return reply.code(500).send({ error: "No fue posible completar la solicitud." });
  }
}

export function requireString(value: unknown, field_name: string): string {
  try {
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new ApiError(400, `El campo ${field_name} es obligatorio.`);
    }

    return value.trim();
  } catch (error) {
    throw toApiError(error);
  }
}

export function requireDate(value: unknown, field_name: string): string {
  try {
    const date_value = requireString(value, field_name);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date_value)) {
      throw new ApiError(400, `El campo ${field_name} debe ser una fecha válida.`);
    }

    return date_value;
  } catch (error) {
    throw toApiError(error);
  }
}

export function requireUuid(value: unknown, field_name: string): string {
  try {
    const uuid_value = requireString(value, field_name);
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid_value)) {
      throw new ApiError(400, `El campo ${field_name} debe ser un identificador válido.`);
    }

    return uuid_value;
  } catch (error) {
    throw toApiError(error);
  }
}

export function requireBoolean(value: unknown, field_name: string): boolean {
  try {
    if (typeof value !== "boolean") {
      throw new ApiError(400, `El campo ${field_name} debe ser verdadero o falso.`);
    }

    return value;
  } catch (error) {
    throw toApiError(error);
  }
}

export function optionalNullableString(
  value: unknown,
  field_name: string,
): string | null | undefined {
  try {
    if (value === undefined || value === null) {
      return value;
    }

    if (typeof value !== "string") {
      throw new ApiError(400, `El campo ${field_name} debe ser texto o null.`);
    }

    return value;
  } catch (error) {
    throw toApiError(error);
  }
}
