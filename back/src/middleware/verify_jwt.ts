import type { FastifyReply, FastifyRequest } from "fastify";

export async function verifyJwt(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  await request.jwtVerify();
}
