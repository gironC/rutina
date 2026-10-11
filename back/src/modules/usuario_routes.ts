import type { FastifyInstance, FastifyReply } from "fastify";
import { AuthServiceError } from "./auth_service";
import { getUserProfile } from "./usuario_service";

export async function usuarioRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/perfil",
    {
      preHandler: async (request, reply) => {
        try {
          await request.jwtVerify();
        } catch {
          reply.code(401).send({ message: "Tu sesión no es válida. Inicia sesión nuevamente." });
        }
      },
    },
    async (request, reply: FastifyReply) => {
      try {
        return reply.send(await getUserProfile(request.user.sub));
      } catch (error) {
        const serviceError = error instanceof AuthServiceError
          ? error
          : new AuthServiceError(500, "No fue posible cargar tu perfil.");
        return reply.code(serviceError.statusCode).send({ message: serviceError.message });
      }
    },
  );
}
