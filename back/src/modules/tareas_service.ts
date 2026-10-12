import type { PoolClient } from "pg";
import { database_pool } from "../config/database";

type TaskFields = {
  nombre: string;
  descripcion: string | null;
  es_mensual: boolean;
  es_unica: boolean;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  hora_inicio?: string | null;
  hora_fin?: string | null;
  recurrencia: string;
};

type TaskUpdate = TaskFields & {
  id: string;
  activo: boolean;
};

type Occurrence = {
  id: string;
  descripcion: string | null;
  fecha_ejecucion: string;
  estado: string | null;
};

export type TaskForDate = {
  id: string;
  nombre: string;
  descripcion: string | null;
  es_mensual: boolean;
  es_unica: boolean;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  hora_inicio: string | null;
  hora_fin: string | null;
  recurrencia: string;
  ocurrencias: Occurrence[];
};

export class TaskServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "TaskServiceError";
  }
}

function rethrowSafeError(error: unknown): never {
  if (error instanceof TaskServiceError) {
    throw error;
  }

  throw new TaskServiceError(500, "No fue posible completar la operación. Inténtalo más tarde.");
}

function isDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === value;
}

function validateTime(value: unknown, field: string): void {
  if (
    value !== undefined &&
    value !== null &&
    (typeof value !== "string" || !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d(\.\d+)?)?$/.test(value))
  ) {
    throw new TaskServiceError(400, `El valor de ${field} no es una hora válida.`);
  }
}

function validateTaskFields(data: TaskFields): void {
  if (
    !data ||
    typeof data.nombre !== "string" ||
    !data.nombre.trim() ||
    (typeof data.descripcion !== "string" && data.descripcion !== null) ||
    typeof data.es_mensual !== "boolean" ||
    typeof data.es_unica !== "boolean" ||
    typeof data.recurrencia !== "string"
  ) {
    throw new TaskServiceError(400, "Revisa los datos obligatorios de la tarea.");
  }

  for (const field of ["fecha_inicio", "fecha_fin"] as const) {
    const value = data[field];
    if (value !== undefined && value !== null && !isDate(value)) {
      throw new TaskServiceError(400, `El valor de ${field} no es una fecha válida.`);
    }
  }

  validateTime(data.hora_inicio, "hora_inicio");
  validateTime(data.hora_fin, "hora_fin");
}

async function runAsUser<T>(
  usuario_id: string,
  operation: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await database_pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("SELECT set_config('app.usuario_id', $1, true)", [usuario_id]);
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export async function crearTarea(
  usuario_id: string,
  data: TaskFields,
): Promise<{ id: string }> {
  try {
    validateTaskFields(data);

    return await runAsUser(usuario_id, async (client) => {
      const columns = [
        "usuario_id",
        "nombre",
        "descripcion",
        "es_mensual",
        "es_unica",
        "recurrencia",
      ];
      const values: unknown[] = [
        usuario_id,
        data.nombre.trim(),
        data.descripcion,
        data.es_mensual,
        data.es_unica,
        data.recurrencia,
      ];

      for (const field of [
        "fecha_inicio",
        "fecha_fin",
        "hora_inicio",
        "hora_fin",
      ] as const) {
        if (data[field] !== undefined && data[field] !== null) {
          columns.push(field);
          values.push(data[field]);
        }
      }

      const placeholders = values.map((_, index) => `$${index + 1}`);
      const result = await client.query<{ id: string }>(
        `INSERT INTO public.tarea (${columns.join(", ")})
         VALUES (${placeholders.join(", ")})
         RETURNING id`,
        values,
      );

      return { id: result.rows[0].id };
    });
  } catch (error) {
    return rethrowSafeError(error);
  }
}

export async function modificarTarea(
  usuario_id: string,
  data: TaskUpdate,
): Promise<true> {
  try {
    validateTaskFields(data);
    if (!data.id || !/^[0-9a-f-]{36}$/i.test(data.id) || typeof data.activo !== "boolean") {
      throw new TaskServiceError(400, "Los datos para modificar la tarea no son válidos.");
    }

    return await runAsUser(usuario_id, async (client) => {
      const assignments = [
        "nombre = $1",
        "descripcion = $2",
        "es_mensual = $3",
        "es_unica = $4",
        "recurrencia = $5",
        "activo = $6",
        "modificacion = now()",
      ];
      const values: unknown[] = [
        data.nombre.trim(),
        data.descripcion,
        data.es_mensual,
        data.es_unica,
        data.recurrencia,
        data.activo,
      ];

      for (const field of [
        "fecha_inicio",
        "fecha_fin",
        "hora_inicio",
        "hora_fin",
      ] as const) {
        if (data[field] !== undefined && data[field] !== null) {
          values.push(data[field]);
          assignments.push(`${field} = $${values.length}`);
        }
      }

      values.push(data.id, usuario_id);
      const result = await client.query(
        `UPDATE public.tarea
         SET ${assignments.join(", ")}
         WHERE id = $${values.length - 1} AND usuario_id = $${values.length}`,
        values,
      );

      if (result.rowCount === 0) {
        throw new TaskServiceError(404, "No se encontró la tarea indicada.");
      }

      return true as const;
    });
  } catch (error) {
    return rethrowSafeError(error);
  }
}

export async function listarFecha(
  usuario_id: string,
  fecha: string,
): Promise<TaskForDate[]> {
  try {
    if (!isDate(fecha)) {
      throw new TaskServiceError(400, "Indica una fecha válida para consultar las tareas.");
    }

    return await runAsUser(usuario_id, async (client) => {
      const result = await client.query<TaskForDate>(
        `SELECT
           t.id,
           t.nombre,
           t.descripcion,
           t.es_mensual,
           t.es_unica,
           t.fecha_inicio,
           t.fecha_fin,
           t.hora_inicio,
           t.hora_fin,
           t.recurrencia,
           COALESCE(
             json_agg(
               json_build_object(
                 'id', o.id,
                 'descripcion', o.descripcion,
                 'fecha_ejecucion', o.fecha_ejecucion,
                 'estado', o.estado
               ) ORDER BY o.creacion
             ) FILTER (WHERE o.id IS NOT NULL),
             '[]'::json
           ) AS ocurrencias
         FROM public.tarea AS t
         LEFT JOIN public.ocurrencia AS o
           ON o.tarea_id = t.id AND o.fecha_ejecucion = $2
         WHERE t.usuario_id = $1
           AND t.activo IS TRUE
           AND t.fecha_inicio <= $2
           AND (t.fecha_fin IS NULL OR t.fecha_fin >= $2)
         GROUP BY t.id
         ORDER BY t.hora_inicio NULLS LAST, t.nombre`,
        [usuario_id, fecha],
      );

      return result.rows;
    });
  } catch (error) {
    return rethrowSafeError(error);
  }
}
