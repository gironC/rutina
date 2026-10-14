import type { FastifyPluginAsync, FastifyReply } from "fastify";
import { env } from "../config/env";
import { verifyJwt } from "../middleware/verify_jwt";
import { ApiError, sendApiError, toApiError } from "../services/api_errors";
import { actualizarPerfil, login, logout, refresh, registro } from "./auth_service";

interface CredencialesBody {
  usuario: string;
  contrasena: string;
}

interface RegistroBody extends CredencialesBody {
  nombres: string;
  apellidos: string;
}

interface ActualizarPerfilBody {
  nombres: string;
  apellidos: string;
}

function setSessionCookie(reply: FastifyReply, rutina_sesion: string): void {
  try {
    reply.setCookie("rutina_sesion", rutina_sesion, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      domain: env.COOKIE_DOMAIN || undefined,
      maxAge: env.REFRESH_TOKEN_DAYS * 24 * 60 * 60,
    });
  } catch (error) {
    throw toApiError(error);
  }
}

function clearSessionCookie(reply: FastifyReply): void {
  try {
    reply.clearCookie("rutina_sesion", {
      path: "/",
      domain: env.COOKIE_DOMAIN || undefined,
    });
  } catch (error) {
    throw toApiError(error);
  }
}

export const authRoutes: FastifyPluginAsync = async (app) => {
  try {
    app.post<{ Body: RegistroBody }>("/registro", async (request, reply) => {
      try {
        const id = await registro(request.body);
        return reply.code(201).send({ id });
      } catch (error) {
        return sendApiError(reply, error);
      }
    });

    app.post<{ Body: CredencialesBody }>("/login", async (request, reply) => {
      try {
        const respuesta = await login(request.body, request.server);
        setSessionCookie(reply, respuesta.rutina_sesion);
        const { rutina_sesion: _rutina_sesion, ...respuesta_publica } = respuesta;
        return reply.send(respuesta_publica);
      } catch (error) {
        return sendApiError(reply, error);
      }
    });

    app.post("/refresh", async (request, reply) => {
      try {
        const rutina_sesion = request.cookies.rutina_sesion;
        if (!rutina_sesion) {
          throw new ApiError(401, "La sesión no existe.");
        }

        const jwt = await refresh(rutina_sesion, request.server);
        return reply.send({ jwt });
      } catch (error) {
        if (toApiError(error).clearSessionCookie) {
          clearSessionCookie(reply);
        }
        return sendApiError(reply, error);
      }
    });

    app.post("/logout", async (request, reply) => {
      try {
        const rutina_sesion = request.cookies.rutina_sesion;
        if (!rutina_sesion) {
          throw new ApiError(401, "La sesión no existe.");
        }

        const resultado = await logout(rutina_sesion);
        clearSessionCookie(reply);
        return reply.send(resultado);
      } catch (error) {
        return sendApiError(reply, error);
      }
    });

    app.post<{ Body: ActualizarPerfilBody }>(
      "/actualizar_perfil",
      { preHandler: verifyJwt },
      async (request, reply) => {
        try {
          return reply.send(await actualizarPerfil(request.body, request.user.sub));
        } catch (error) {
          return sendApiError(reply, error);
        }
      },
    );
  } catch (error) {
    throw toApiError(error);
  }
};
