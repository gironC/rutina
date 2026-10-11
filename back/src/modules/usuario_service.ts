import type { PoolClient } from "pg";
import { database_pool } from "../config/database";
import { AuthServiceError } from "./auth_service";

type Profile = {
  id: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
};

export async function getUserProfile(usuario_id: string): Promise<Profile> {
  let client: PoolClient | undefined;

  try {
    client = await database_pool.connect();
    await client.query("BEGIN");
    await client.query("SELECT set_config('app.usuario_id', $1, true)", [usuario_id]);
    const result = await client.query<Profile>(
      `SELECT id, nombres, apellidos, telefono, correo
       FROM public.usuario
       WHERE id = $1 AND activo IS TRUE
       LIMIT 1`,
      [usuario_id],
    );

    if (!result.rows[0]) {
      throw new AuthServiceError(404, "No se encontró la información de tu cuenta.");
    }

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => undefined);
    }
    if (error instanceof AuthServiceError) {
      throw error;
    }
    throw new AuthServiceError(500, "No fue posible cargar tu perfil.");
  } finally {
    client?.release();
  }
}
