import type { FastifyInstance, FastifyReply } from "fastify";
import { env } from "../config/env";
import {
  AuthServiceError,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "./auth_service";

type RegistrationBody = {
  correo: string;
  pass: string;
  nombres: string;
  apellidos: string;
  telefono: string;
};

type LoginBody = { correo: string; pass: string };

function sendError(reply: FastifyReply, error: unknown) {
  const serviceError = error instanceof AuthServiceError
    ? error
    : new AuthServiceError(500, "Ocurrió un error. Inténtalo de nuevo más tarde.");

  return reply.code(serviceError.statusCode).send({ message: serviceError.message });
}

function cookieOptions() {
  return {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  };
}

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: RegistrationBody }>("/registro", async (request, reply) => {
    try {
      const result = await registerUser(request.body);
      return reply.code(201).send(result);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.post<{ Body: LoginBody }>("/login", async (request, reply) => {
    try {
      const result = await loginUser(request.body, (payload) => app.jwt.sign(payload));
      reply.setCookie("rutina_sesion", result.refresh_token, {
        ...cookieOptions(),
        maxAge: env.REFRESH_TOKEN_DAYS * 24 * 60 * 60,
      });
      const { refresh_token: _refresh_token, ...response } = result;
      return reply.send(response);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.post("/refresh", async (request, reply) => {
    try {
      const result = await refreshAccessToken(request.cookies.rutina_sesion, (payload) =>
        app.jwt.sign(payload),
      );
      return reply.send(result);
    } catch (error) {
      reply.clearCookie("rutina_sesion", cookieOptions());
      return sendError(reply, error);
    }
  });

  app.post("/logout", async (request, reply) => {
    try {
      const result = await logoutUser(request.cookies.rutina_sesion);
      reply.clearCookie("rutina_sesion", cookieOptions());
      return reply.send(result);
    } catch (error) {
      reply.clearCookie("rutina_sesion", cookieOptions());
      return sendError(reply, error);
    }
  });
}
