import {
  ApiError,
  requireBoolean,
  requireDate,
  requireString,
  requireUuid,
  toApiError,
} from "../services/api_errors";
import { withDatabaseTransaction } from "../services/database_transaction";

interface OcurrenciaBody {
  id?: unknown;
  tarea_id?: unknown;
  estado?: unknown;
  fecha_ejecucion?: unknown;
  ocurrencia_id?: unknown;
  nota?: unknown;
  activo?: unknown;
  nombre?: unknown;
  completada?: unknown;
}

function requireEnumValue(value: unknown, field_name: string, values: string[]): string {
  try {
    const enum_value = requireString(value, field_name);
    if (!values.includes(enum_value)) {
      throw new ApiError(400, `El campo ${field_name} no es válido.`);
    }

    return enum_value;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function crear(datos: OcurrenciaBody, usuario_id: string): Promise<string> {
  try {
    const tarea_id = requireUuid(datos?.tarea_id, "tarea_id");
    const estado = requireEnumValue(datos?.estado, "estado", ["completada", "cancelada", "pospuesta"]);
    const fecha_ejecucion = requireDate(datos?.fecha_ejecucion, "fecha_ejecucion");

    return await withDatabaseTransaction(usuario_id, async (client) => {
      const ocurrencia_resultado = await client.query<{ id: string }>(
        `INSERT INTO ocurrencia (tarea_id, estado, fecha_ejecucion)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [tarea_id, estado, fecha_ejecucion],
      );
      return ocurrencia_resultado.rows[0].id;
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function modificar(datos: OcurrenciaBody, usuario_id: string): Promise<boolean> {
  try {
    const id = requireUuid(datos?.id, "id");
    const estado = requireEnumValue(datos?.estado, "estado", ["completada", "cancelada", "pospuesta"]);

    return await withDatabaseTransaction(usuario_id, async (client) => {
      const consulta = await client.query(
        `UPDATE ocurrencia
         SET estado = $2, modificacion = now()
         WHERE id = $1`,
        [id, estado],
      );
      return consulta.rowCount === 1;
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function crearNota(datos: OcurrenciaBody, usuario_id: string): Promise<string> {
  try {
    const ocurrencia_id = requireUuid(datos?.ocurrencia_id, "ocurrencia_id");
    const nota = requireString(datos?.nota, "nota");

    return await withDatabaseTransaction(usuario_id, async (client) => {
      const nota_resultado = await client.query<{ id: string }>(
        `INSERT INTO nota_ocurrencia (ocurrencia_id, nota)
         VALUES ($1, $2)
         RETURNING id`,
        [ocurrencia_id, nota],
      );
      return nota_resultado.rows[0].id;
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function modificarNota(datos: OcurrenciaBody, usuario_id: string): Promise<boolean> {
  try {
    const id = requireUuid(datos?.id, "id");
    const nota = requireString(datos?.nota, "nota");
    const activo = requireBoolean(datos?.activo, "activo");

    return await withDatabaseTransaction(usuario_id, async (client) => {
      const consulta = await client.query(
        `UPDATE nota_ocurrencia
         SET nota = $2, activo = $3, modificacion = now()
         WHERE id = $1`,
        [id, nota, activo],
      );
      return consulta.rowCount === 1;
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function crearLista(datos: OcurrenciaBody, usuario_id: string): Promise<string> {
  try {
    const ocurrencia_id = requireUuid(datos?.ocurrencia_id, "ocurrencia_id");
    const nombre = requireString(datos?.nombre, "nombre");

    return await withDatabaseTransaction(usuario_id, async (client) => {
      const lista_resultado = await client.query<{ id: string }>(
        `INSERT INTO lista_ocurrencia (ocurrencia_id, nombre)
         VALUES ($1, $2)
         RETURNING id`,
        [ocurrencia_id, nombre],
      );
      return lista_resultado.rows[0].id;
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function modificarLista(datos: OcurrenciaBody, usuario_id: string): Promise<boolean> {
  try {
    const id = requireUuid(datos?.id, "id");
    const nombre = requireString(datos?.nombre, "nombre");
    const completada = requireBoolean(datos?.completada, "completada");
    const activo = requireBoolean(datos?.activo, "activo");

    return await withDatabaseTransaction(usuario_id, async (client) => {
      const consulta = await client.query(
        `UPDATE lista_ocurrencia
         SET nombre = $2, completada = $3, activo = $4, modificacion = now()
         WHERE id = $1`,
        [id, nombre, completada, activo],
      );
      return consulta.rowCount === 1;
    });
  } catch (error) {
    throw toApiError(error);
  }
}
