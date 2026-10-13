import type { FastifyPluginAsync } from "fastify";
import { sendApiError, toApiError } from "../services/api_errors";
import { verifyJwt } from "../middleware/verify_jwt";
import { crear, detalle, listaFecha, listarRango, modificar } from "./tareas_service";

interface TareaBody {
  [key: string]: unknown;
}

export const tareasRoutes: FastifyPluginAsync = async (app) => {
  try {
    app.post<{ Body: TareaBody }>("/crear", { preHandler: verifyJwt }, async (request, reply) => {
      try {
        const id = await crear(request.body, request.user.sub);
        return reply.code(201).send({ id });
      } catch (error) {
        return sendApiError(reply, error);
      }
    });

    app.post<{ Body: TareaBody }>("/modificar", { preHandler: verifyJwt }, async (request, reply) => {
      try {
        return reply.send(await modificar(request.body, request.user.sub));
      } catch (error) {
        return sendApiError(reply, error);
      }
    });

    app.post<{ Body: TareaBody }>("/detalle", { preHandler: verifyJwt }, async (request, reply) => {
      try {
        return reply.send(await detalle(request.body, request.user.sub));
      } catch (error) {
        return sendApiError(reply, error);
      }
    });

    app.post<{ Body: TareaBody }>("/lista_fecha", { preHandler: verifyJwt }, async (request, reply) => {
      try {
        return reply.send(await listaFecha(request.body, request.user.sub));
      } catch (error) {
        return sendApiError(reply, error);
      }
    });

    app.post<{ Body: TareaBody }>("/listar_rango", { preHandler: verifyJwt }, async (request, reply) => {
      try {
        return reply.send(await listarRango(request.body, request.user.sub));
      } catch (error) {
        return sendApiError(reply, error);
      }
    });
  } catch (error) {
    throw toApiError(error);
  }
};
