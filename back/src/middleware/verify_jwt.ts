import type { FastifyReply, FastifyRequest } from "fastify";
import { toApiError } from "../services/api_errors";

export async function verifyJwt(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch (error) {
    throw toApiError(error);
  }
}
