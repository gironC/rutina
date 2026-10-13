import type { PoolClient } from "pg";
import {
  ApiError,
  optionalNullableString,
  requireBoolean,
  requireDate,
  requireString,
  requireUuid,
  toApiError,
} from "../services/api_errors";
import { withDatabaseTransaction } from "../services/database_transaction";

interface TaskBody {
  id?: unknown;
  nombre?: unknown;
  descripcion?: unknown;
  tipo?: unknown;
  hora_inicio?: unknown;
  hora_fin?: unknown;
  fecha_inicio?: unknown;
  fecha_fin?: unknown;
  recurrencia?: unknown;
  activo?: unknown;
  fecha?: unknown;
  fecha_inicio_rango?: unknown;
  fecha_fin_rango?: unknown;
}

async function listTasksByType(
  usuario_id: string,
  fecha_inicio: string,
  fecha_fin: string,
  tipo_filtro: "unica_recurrente" | "flexible",
  es_rango: boolean,
): Promise<unknown[]> {
  try {
    return await withDatabaseTransaction(usuario_id, async (client) => {
      if (es_rango) {
        const tipo_condition = tipo_filtro === "flexible"
          ? "t.tipo = 'flexible'"
          : "t.tipo IN ('unica', 'recurrente')";
        const consulta = await client.query(
          `SELECT to_jsonb(t) || jsonb_build_object('ocurrencias', o.ocurrencias) AS tarea
           FROM tarea AS t
           LEFT JOIN LATERAL (
             SELECT COALESCE(
               jsonb_agg(to_jsonb(oc) ORDER BY oc.fecha_ejecucion),
               '[]'::jsonb
             ) AS ocurrencias
             FROM ocurrencia AS oc
             WHERE oc.tarea_id = t.id
               AND oc.fecha_ejecucion >= $1
               AND oc.fecha_ejecucion <= $2
           ) AS o ON true
           WHERE ${tipo_condition}
             AND t.activo = true
             AND t.fecha_inicio >= $1
             AND (t.fecha_fin IS NULL OR t.fecha_fin <= $2)
           ORDER BY t.fecha_inicio, t.hora_inicio, t.creacion`,
          [fecha_inicio, fecha_fin],
        );
        return consulta.rows.map((fila) => fila.tarea);
      }

      const fecha = fecha_inicio;
      const tipo_condition = tipo_filtro === "flexible"
        ? "t.tipo = 'flexible'"
        : "t.tipo IN ('unica', 'recurrente')";
      const consulta = await client.query(
        `SELECT to_jsonb(t) || jsonb_build_object('ocurrencia', o.ocurrencia) AS tarea
         FROM tarea AS t
         LEFT JOIN LATERAL (
           SELECT to_jsonb(oc) AS ocurrencia
           FROM ocurrencia AS oc
           WHERE oc.tarea_id = t.id
             AND oc.fecha_ejecucion = $1
           ORDER BY oc.creacion
           LIMIT 1
         ) AS o ON true
         WHERE ${tipo_condition}
           AND t.activo = true
           AND t.fecha_inicio >= $1
           AND (t.fecha_fin IS NULL OR t.fecha_fin <= $1)
         ORDER BY t.fecha_inicio, t.hora_inicio, t.creacion`,
        [fecha],
      );
      return consulta.rows.map((fila) => fila.tarea);
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function crear(datos: TaskBody, usuario_id: string): Promise<string> {
  try {
    const nombre = requireString(datos?.nombre, "nombre");
    const descripcion = requireString(datos?.descripcion, "descripcion");
    const tipo = requireString(datos?.tipo, "tipo");
    if (!["unica", "recurrente", "flexible"].includes(tipo)) {
      throw new ApiError(400, "El campo tipo no es válido.");
    }

    const hora_inicio = optionalNullableString(datos?.hora_inicio, "hora_inicio") ?? null;
    const hora_fin = optionalNullableString(datos?.hora_fin, "hora_fin") ?? null;
    const fecha_inicio = requireDate(datos?.fecha_inicio, "fecha_inicio");
    const fecha_fin = optionalNullableString(datos?.fecha_fin, "fecha_fin") ?? null;
    const recurrencia = requireString(datos?.recurrencia, "recurrencia");

    return await withDatabaseTransaction(usuario_id, async (client) => {
      const tarea_resultado = await client.query<{ id: string }>(
        `INSERT INTO tarea (
           usuario_id, nombre, descripcion, tipo, hora_inicio, hora_fin,
           fecha_inicio, fecha_fin, recurrencia
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [usuario_id, nombre, descripcion, tipo, hora_inicio, hora_fin, fecha_inicio, fecha_fin, recurrencia],
      );
      return tarea_resultado.rows[0].id;
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function modificar(datos: TaskBody, usuario_id: string): Promise<boolean> {
  try {
    const id = requireUuid(datos?.id, "id");
    const campos: Array<{ nombre: string; valor: unknown }> = [
      { nombre: "nombre", valor: requireString(datos?.nombre, "nombre") },
      { nombre: "descripcion", valor: requireString(datos?.descripcion, "descripcion") },
    ];
    const tipo = requireString(datos?.tipo, "tipo");
    if (!["unica", "recurrente", "flexible"].includes(tipo)) {
      throw new ApiError(400, "El campo tipo no es válido.");
    }
    campos.push({ nombre: "tipo", valor: tipo });
    const fecha_inicio = requireDate(datos?.fecha_inicio, "fecha_inicio");
    campos.push({ nombre: "fecha_inicio", valor: fecha_inicio });
    campos.push({ nombre: "recurrencia", valor: requireString(datos?.recurrencia, "recurrencia") });
    campos.push({ nombre: "activo", valor: requireBoolean(datos?.activo, "activo") });

    for (const nombre of ["hora_inicio", "hora_fin", "fecha_fin"] as const) {
      if (Object.prototype.hasOwnProperty.call(datos, nombre)) {
        campos.push({ nombre, valor: optionalNullableString(datos[nombre], nombre) ?? null });
      }
    }

    return await withDatabaseTransaction(usuario_id, async (client) => {
      const parametros: unknown[] = [id];
      const asignaciones = campos.map((campo) => {
        parametros.push(campo.valor);
        return `${campo.nombre} = $${parametros.length}`;
      });
      const consulta = await client.query(
        `UPDATE tarea
         SET ${asignaciones.join(", ")}, modificacion = now()
         WHERE id = $1`,
        parametros,
      );
      return consulta.rowCount === 1;
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function detalle(datos: TaskBody, usuario_id: string): Promise<unknown | null> {
  try {
    const id = requireUuid(datos?.id, "id");
    const fecha = requireDate(datos?.fecha, "fecha");

    return await withDatabaseTransaction(usuario_id, async (client: PoolClient) => {
      const consulta = await client.query<{ detalle: unknown }>(
        `SELECT to_jsonb(t) || jsonb_build_object(
           'ocurrencia',
           CASE WHEN o.id IS NULL THEN NULL
             ELSE to_jsonb(o) || jsonb_build_object(
               'notas', COALESCE(n.notas, '[]'::jsonb),
               'lista', COALESCE(l.lista, '[]'::jsonb)
             )
           END
         ) AS detalle
         FROM tarea AS t
         LEFT JOIN LATERAL (
           SELECT oc.*
           FROM ocurrencia AS oc
           WHERE oc.tarea_id = t.id AND oc.fecha_ejecucion = $2
           ORDER BY oc.creacion
           LIMIT 1
         ) AS o ON true
         LEFT JOIN LATERAL (
           SELECT jsonb_agg(to_jsonb(no) ORDER BY no.creacion) AS notas
           FROM nota_ocurrencia AS no
           WHERE no.ocurrencia_id = o.id AND no.activo = true
         ) AS n ON true
         LEFT JOIN LATERAL (
           SELECT jsonb_agg(to_jsonb(lo) ORDER BY lo.creacion) AS lista
           FROM lista_ocurrencia AS lo
           WHERE lo.ocurrencia_id = o.id AND lo.activo = true
         ) AS l ON true
         WHERE t.id = $1
         LIMIT 1`,
        [id, fecha],
      );
      return consulta.rows[0]?.detalle ?? null;
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export async function listaFecha(datos: TaskBody, usuario_id: string): Promise<{
  tareas: unknown[];
  flexibles: unknown[];
}> {
  try {
    const fecha = requireDate(datos?.fecha, "fecha");
    const [tareas, flexibles] = await Promise.all([
      listTasksByType(usuario_id, fecha, fecha, "unica_recurrente", false),
      listTasksByType(usuario_id, fecha, fecha, "flexible", false),
    ]);
    return { tareas, flexibles };
  } catch (error) {
    throw toApiError(error);
  }
}

export async function listarRango(datos: TaskBody, usuario_id: string): Promise<{
  tareas: unknown[];
  flexibles: unknown[];
}> {
  try {
    const fecha_inicio = requireDate(datos?.fecha_inicio, "fecha_inicio");
    const fecha_fin = requireDate(datos?.fecha_fin, "fecha_fin");
    if (fecha_inicio > fecha_fin) {
      throw new ApiError(400, "La fecha_inicio debe ser anterior o igual a fecha_fin.");
    }

    const [tareas, flexibles] = await Promise.all([
      listTasksByType(usuario_id, fecha_inicio, fecha_fin, "unica_recurrente", true),
      listTasksByType(usuario_id, fecha_inicio, fecha_fin, "flexible", true),
    ]);
    return { tareas, flexibles };
  } catch (error) {
    throw toApiError(error);
  }
}
