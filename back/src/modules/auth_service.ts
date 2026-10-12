import { createHash, randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import type { PoolClient } from "pg";
import { database_pool } from "../config/database";
import { env } from "../config/env";

type RegistrationData = {
  correo: string;
  pass: string;
  nombres: string;
  apellidos: string;
  telefono: string;
};

type LoginData = Pick<RegistrationData, "correo" | "pass">;
type JwtPayload = { sub: string };
type JwtSigner = (payload: JwtPayload) => string;

type UserRecord = {
  id: string;
  correo: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  pass: string;
};

export class AuthServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AuthServiceError";
  }
}

function throwSafeError(error: unknown): never {
  if (error instanceof AuthServiceError) {
    throw error;
  }

  throw new AuthServiceError(500, "Ocurrió un error. Inténtalo de nuevo más tarde.");
}

function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function withUserContext<T>(
  client: PoolClient,
  usuario_id: string,
  operation: () => Promise<T>,
): Promise<T> {
  await client.query("SELECT set_config('app.usuario_id', $1, true)", [usuario_id]);
  return operation();
}

export async function registerUser(data: RegistrationData): Promise<{ id: string }> {
  try {
    if (
      !data ||
      typeof data.correo !== "string" ||
      typeof data.pass !== "string" ||
      typeof data.nombres !== "string" ||
      typeof data.apellidos !== "string" ||
      typeof data.telefono !== "string"
    ) {
      throw new AuthServiceError(400, "Completa todos los campos para registrarte.");
    }

    const correo = data.correo?.trim().toLowerCase();
    const nombres = data.nombres?.trim();
    const apellidos = data.apellidos?.trim();
    const telefono = data.telefono?.trim();

    if (!correo || !data.pass || !nombres || !apellidos || !telefono) {
      throw new AuthServiceError(400, "Completa todos los campos para registrarte.");
    }

    if (!/^\S+@\S+\.\S+$/.test(correo)) {
      throw new AuthServiceError(400, "Ingresa un correo electrónico válido.");
    }

    if (!/^\d{8}$/.test(telefono)) {
      throw new AuthServiceError(400, "El teléfono debe contener exactamente 8 dígitos.");
    }

    const existingUser = await database_pool.query(
      "SELECT id FROM public.usuario WHERE correo = $1 LIMIT 1",
      [correo],
    );

    if (existingUser.rowCount) {
      throw new AuthServiceError(409, "Ya existe una cuenta con ese correo.");
    }

    const pass = await bcrypt.hash(data.pass, 12);
    const result = await database_pool.query<{ id: string }>(
      `INSERT INTO public.usuario (correo, pass, nombres, apellidos, telefono)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [correo, pass, nombres, apellidos, telefono],
    );

    return { id: result.rows[0].id };
  } catch (error) {
    return throwSafeError(error);
  }
}

export async function loginUser(
  data: LoginData,
  signJwt: JwtSigner,
): Promise<{
  correo: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  jwt: string;
  refresh_token: string;
}> {
  try {
    if (!data || typeof data.correo !== "string" || typeof data.pass !== "string") {
      throw new AuthServiceError(400, "Ingresa tu correo y contraseña.");
    }

    const correo = data.correo?.trim().toLowerCase();
    if (!correo || !data.pass) {
      throw new AuthServiceError(400, "Ingresa tu correo y contraseña.");
    }

    const result = await database_pool.query<UserRecord>(
      `SELECT id, correo, nombres, apellidos, telefono, pass
       FROM public.usuario
       WHERE correo = $1 AND activo IS TRUE
       LIMIT 1`,
      [correo],
    );
    const usuario = result.rows[0];

    if (
      !usuario ||
      typeof usuario.pass !== "string" ||
      !(await bcrypt.compare(data.pass, usuario.pass))
    ) {
      throw new AuthServiceError(401, "El correo o la contraseña son incorrectos.");
    }

    const refresh_token = randomUUID();
    const hash = hashRefreshToken(refresh_token);
    const vencimiento = new Date(
      Date.now() + env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
    );
    const jwt = signJwt({ sub: usuario.id });
    const client = await database_pool.connect();

    try {
      await client.query("BEGIN");
      await withUserContext(client, usuario.id, async () => {
        await client.query(
          `INSERT INTO public.refresh_token (usuario_id, hash, creacion, vencimiento)
           VALUES ($1, $2, now(), $3)`,
          [usuario.id, hash, vencimiento],
        );
      });
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    return {
      correo: usuario.correo,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      telefono: usuario.telefono,
      jwt,
      refresh_token,
    };
  } catch (error) {
    return throwSafeError(error);
  }
}

export async function refreshAccessToken(
  refresh_token: string | undefined,
  signJwt: JwtSigner,
): Promise<{ jwt: string }> {
  try {
    if (!refresh_token) {
      throw new AuthServiceError(401, "La sesión ha expirado. Inicia sesión nuevamente.");
    }

    const hash = hashRefreshToken(refresh_token);
    const result = await database_pool.query<{
      id: string;
      usuario_id: string;
      vencimiento: Date;
    }>(
      `SELECT id, usuario_id, vencimiento
       FROM public.refresh_token
       WHERE hash = $1
       LIMIT 1`,
      [hash],
    );
    const token = result.rows[0];

    if (!token) {
      throw new AuthServiceError(401, "La sesión no es válida. Inicia sesión nuevamente.");
    }

    if (new Date(token.vencimiento).getTime() <= Date.now()) {
      const client = await database_pool.connect();
      try {
        await client.query("BEGIN");
        await withUserContext(client, token.usuario_id, async () => {
          await client.query("DELETE FROM public.refresh_token WHERE id = $1", [token.id]);
        });
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }

      throw new AuthServiceError(401, "La sesión ha expirado. Inicia sesión nuevamente.");
    }

    const usuarioResult = await database_pool.query<{ id: string }>(
      "SELECT id FROM public.usuario WHERE id = $1 AND activo IS TRUE LIMIT 1",
      [token.usuario_id],
    );
    if (!usuarioResult.rows[0]) {
      throw new AuthServiceError(401, "La sesión no es válida. Inicia sesión nuevamente.");
    }

    return { jwt: signJwt({ sub: token.usuario_id }) };
  } catch (error) {
    return throwSafeError(error);
  }
}

export async function logoutUser(refresh_token: string | undefined): Promise<true> {
  try {
    if (!refresh_token) {
      throw new AuthServiceError(401, "No hay una sesión activa para cerrar.");
    }

    const result = await database_pool.query<{ id: string; usuario_id: string }>(
      `SELECT id, usuario_id
       FROM public.refresh_token
       WHERE hash = $1
       LIMIT 1`,
      [hashRefreshToken(refresh_token)],
    );
    const token = result.rows[0];

    if (token) {
      const client = await database_pool.connect();
      try {
        await client.query("BEGIN");
        await withUserContext(client, token.usuario_id, async () => {
          await client.query("DELETE FROM public.refresh_token WHERE id = $1", [token.id]);
        });
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }

    return true;
  } catch (error) {
    return throwSafeError(error);
  }
}