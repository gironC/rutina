import path from "node:path";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import fastify from "fastify";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { env } from "./src/config/env";
import { authRoutes } from "./src/modules/auth_routes";
import { ocurrenciasRoutes } from "./src/modules/ocurrencias_routes";
import { tareasRoutes } from "./src/modules/tareas_routes";
import { sendApiError } from "./src/services/api_errors";

export const app = fastify();

app.register(cors, {
  origin: env.CORS_DOMAINS,
  credentials: true,
});

app.register(cookie, {
  parseOptions: env.COOKIE_DOMAIN
    ? { domain: env.COOKIE_DOMAIN }
    : undefined,
});

app.register(jwt, {
  secret: env.JWT_SECRET,
  sign: { expiresIn: env.ACCESS_TOKEN_EXPIRES },
});

app.register(multipart);
app.register(fastifyStatic, {
  root: path.resolve(process.cwd(), "public"),
});

app.setErrorHandler((error, _request, reply) => {
  try {
    return sendApiError(reply, error);
  } catch {
    return reply.code(500).send({ error: "No fue posible completar la solicitud." });
  }
});

app.register(authRoutes, { prefix: "/auth" });
app.register(tareasRoutes, { prefix: "/tareas" });
app.register(ocurrenciasRoutes, { prefix: "/ocurrencias" });
