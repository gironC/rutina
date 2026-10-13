import type { FastifyPluginAsync } from "fastify";
import { verifyJwt } from "../middleware/verify_jwt";
import { sendApiError, toApiError } from "../services/api_errors";
import {
  crear,
  crearLista,
  crearNota,
  modificar,
  modificarLista,
  modificarNota,
} from "./ocurrencias_service";

interface OcurrenciaBody {
  [key: string]: unknown;
}

export const ocurrenciasRoutes: FastifyPluginAsync = async (app) => {
  try {
    app.post<{ Body: OcurrenciaBody }>("/crear", { preHandler: verifyJwt }, async (request, reply) => {
      try {
        const id = await crear(request.body, request.user.sub);
        return reply.code(201).send({ id });
      } catch (error) {
        return sendApiError(reply, error);
      }
    });

    app.post<{ Body: OcurrenciaBody }>("/modificar", { preHandler: verifyJwt }, async (request, reply) => {
      try {
        return reply.send(await modificar(request.body, request.user.sub));
      } catch (error) {
        return sendApiError(reply, error);
      }
    });

    app.post<{ Body: OcurrenciaBody }>("/crear_nota", { preHandler: verifyJwt }, async (request, reply) => {
      try {
        const id = await crearNota(request.body, request.user.sub);
        return reply.code(201).send({ id });
      } catch (error) {
        return sendApiError(reply, error);
      }
    });

    app.post<{ Body: OcurrenciaBody }>("/modificar_nota", { preHandler: verifyJwt }, async (request, reply) => {
      try {
        return reply.send(await modificarNota(request.body, request.user.sub));
      } catch (error) {
        return sendApiError(reply, error);
      }
    });

    app.post<{ Body: OcurrenciaBody }>("/crear_lista", { preHandler: verifyJwt }, async (request, reply) => {
      try {
        const id = await crearLista(request.body, request.user.sub);
        return reply.code(201).send({ id });
      } catch (error) {
        return sendApiError(reply, error);
      }
    });

    app.post<{ Body: OcurrenciaBody }>("/modificar_lista", { preHandler: verifyJwt }, async (request, reply) => {
      try {
        return reply.send(await modificarLista(request.body, request.user.sub));
      } catch (error) {
        return sendApiError(reply, error);
      }
    });
  } catch (error) {
    throw toApiError(error);
  }
};
