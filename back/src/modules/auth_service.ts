import { createHmac, randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import { env } from "../config/env";
import { ApiError, requireString, toApiError } from "../services/api_errors";
import { withDatabaseTransaction } from "../services/database_transaction";

interface RegistroBody {
  usuario?: unknown;
  contrasena?: unknown;
  nombres?: unknown;
  apellidos?: unknown;
}

interface LoginBody {
  usuario?: unknown;
  contrasena?: unknown;
}

function hashRefreshToken(token_sesion: string): string {
  try {
    return createHmac("sha256", env.JWT_SECRET).update(token_sesion).digest("hex");
  } catch (error) {
    throw toApiError(error);
  }
}

export async function registro(datos: RegistroBody): Promise<string> {
  try {
    const correo = requireString(datos?.usuario, "usuario");
    const contrasena = requireString(datos?.contrasena, "contrasena");
    const nombres = requireString(datos?.nombres, "nombres");
    const apellidos = requireString(datos?.apellidos, "apellidos");
    const pass_hash = await bcrypt.hash(contrasena, 12);

    return await withDatabaseTransaction(null, async (client) => {
      const usuario_resultado = await client.query<{ id: string }>(
        `INSERT INTO usuario (correo, nombres, apellidos, pass_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [correo, nombres, apellidos, pass_hash],
      );
      return usuario_resultado.rows[0].id;
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function login(
  datos: LoginBody,
  server: FastifyInstance,
): Promise<{
  correo: string;
  nombres: string;
  apellidos: string;
  jwt: string;
  rutina_sesion: string;
}> {
  try {
    const correo = requireString(datos?.usuario, "usuario");
    const contrasena = requireString(datos?.contrasena, "contrasena");

    const respuesta = await withDatabaseTransaction(null, async (client) => {
      const usuario_resultado = await client.query<{
        id: string;
        correo: string;
        nombres: string;
        apellidos: string;
        pass_hash: string;
      }>(
        `SELECT id, correo, nombres, apellidos, pass_hash
         FROM usuario
         WHERE correo = $1 AND activo = true
         LIMIT 1`,
        [correo],
      );
      const usuario = usuario_resultado.rows[0];

      if (!usuario || !(await bcrypt.compare(contrasena, usuario.pass_hash))) {
        throw new ApiError(401, "El usuario o la contraseña son incorrectos.");
      }

      await client.query("SELECT set_config('app.usuario_id', $1, true)", [usuario.id]);

      const rutina_sesion = randomUUID();
      const refresh_hash = hashRefreshToken(rutina_sesion);
      await client.query(
        `INSERT INTO refresh_token (usuario_id, hash, vencimiento)
         VALUES ($1, $2, now() + ($3 * interval '1 day'))`,
        [usuario.id, refresh_hash, env.REFRESH_TOKEN_DAYS],
      );

      return {
        correo: usuario.correo,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        jwt: server.jwt.sign(
          { sub: usuario.id },
          { expiresIn: env.ACCESS_TOKEN_EXPIRES },
        ),
        rutina_sesion,
      };
    });

    return respuesta;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function refresh(
  rutina_sesion: string,
  server: FastifyInstance,
): Promise<string> {
  try {
    if (!rutina_sesion) {
      throw new ApiError(401, "La sesión no existe.");
    }

    const refresh_hash = hashRefreshToken(rutina_sesion);
    const respuesta = await withDatabaseTransaction(null, async (client) => {
      const token_resultado = await client.query<{
        usuario_id: string;
        expirado: boolean;
      }>(
        `SELECT usuario_id, vencimiento <= now() AS expirado
         FROM refresh_token
         WHERE hash = $1
         LIMIT 1`,
        [refresh_hash],
      );
      const refresh_token = token_resultado.rows[0];

      if (!refresh_token) {
        return { jwt: null, usuario_encontrado: false };
      }

      await client.query("SELECT set_config('app.usuario_id', $1, true)", [refresh_token.usuario_id]);

      if (refresh_token.expirado) {
        await client.query("DELETE FROM refresh_token WHERE hash = $1", [refresh_hash]);
        return { jwt: null, usuario_encontrado: false };
      }

      const usuario_resultado = await client.query<{ id: string }>(
        "SELECT id FROM usuario WHERE id = $1 AND activo = true LIMIT 1",
        [refresh_token.usuario_id],
      );
      const usuario = usuario_resultado.rows[0];

      if (!usuario) {
        return { jwt: null, usuario_encontrado: false };
      }

      return {
        jwt: server.jwt.sign(
          { sub: usuario.id },
          { expiresIn: env.ACCESS_TOKEN_EXPIRES },
        ),
        usuario_encontrado: true,
      };
    });

    if (!respuesta.usuario_encontrado || !respuesta.jwt) {
      throw new ApiError(401, "La sesión no es válida o ha vencido.", true);
    }

    return respuesta.jwt;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function logout(rutina_sesion: string): Promise<boolean> {
  try {
    if (!rutina_sesion) {
      throw new ApiError(401, "La sesión no existe.");
    }

    const refresh_hash = hashRefreshToken(rutina_sesion);
    await withDatabaseTransaction(null, async (client) => {
      const token_resultado = await client.query<{ usuario_id: string }>(
        "SELECT usuario_id FROM refresh_token WHERE hash = $1 LIMIT 1",
        [refresh_hash],
      );
      const refresh_token = token_resultado.rows[0];

      if (refresh_token) {
        await client.query("SELECT set_config('app.usuario_id', $1, true)", [refresh_token.usuario_id]);
        await client.query("DELETE FROM refresh_token WHERE hash = $1", [refresh_hash]);
      }
    });

    return true;
  } catch (error) {
    throw toApiError(error);
  }
}
