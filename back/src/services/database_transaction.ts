import type { PoolClient } from "pg";
import { database_pool } from "../config/database";

export async function withDatabaseTransaction<T>(
  usuario_id: string | null,
  action: (client: PoolClient) => Promise<T>,
): Promise<T> {
  let client: PoolClient | undefined;

  try {
    client = await database_pool.connect();
    await client.query("BEGIN");
    await client.query("SELECT set_config('app.usuario_id', $1, true)", [usuario_id ?? ""]);

    const result = await action(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Keep the original database error.
      }
    }

    throw error;
  } finally {
    client?.release();
  }
}
