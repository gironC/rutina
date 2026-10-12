import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  crearTarea,
  listarFecha,
  modificarTarea,
  TaskServiceError,
} from "./tareas_service";

type TaskBody = {
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

type UpdateTaskBody = TaskBody & {
  id: string;
  activo: boolean;
};

type DateBody = { fecha?: string };

async function verifyTaskJwt(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    reply.code(401).send({ message: "Tu sesión no es válida. Inicia sesión nuevamente." });
  }
}

function sendTaskError(reply: FastifyReply, error: unknown) {
  const serviceError = error instanceof TaskServiceError
    ? error
    : new TaskServiceError(500, "No fue posible completar la operación. Inténtalo más tarde.");

  return reply.code(serviceError.statusCode).send({ message: serviceError.message });
}

export async function tareasRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: TaskBody }>(
    "/crear",
    { preHandler: verifyTaskJwt },
    async (request, reply) => {
      try {
        return reply.code(201).send(await crearTarea(request.user.sub, request.body));
      } catch (error) {
        return sendTaskError(reply, error);
      }
    },
  );

  app.post<{ Body: UpdateTaskBody }>(
    "/modificar",
    { preHandler: verifyTaskJwt },
    async (request, reply) => {
      try {
        return reply.send(await modificarTarea(request.user.sub, request.body));
      } catch (error) {
        return sendTaskError(reply, error);
      }
    },
  );

  app.post<{ Body: DateBody }>(
    "/listar_fecha",
    { preHandler: verifyTaskJwt },
    async (request, reply) => {
      try {
        return reply.send(await listarFecha(request.user.sub, request.body?.fecha ?? ""));
      } catch (error) {
        return sendTaskError(reply, error);
      }
    },
  );
}
