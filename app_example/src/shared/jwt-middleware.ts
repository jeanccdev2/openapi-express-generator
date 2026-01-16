import type { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { ENV } from "@config/env.js";
import { AppException } from "@/shared/api-exception.js";

export async function jwtMiddleware(request: FastifyRequest, _reply: FastifyReply) {
  const authorization = request.headers.authorization;

  if (!authorization) {
    throw AppException.unauthorized("Token não informado");
  }

  const [type, token] = authorization.split(" ");

  if (type !== "Bearer" || !token) {
    throw AppException.unauthorized("Token inválido");
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as string;
    request.user = decoded;
  } catch {
    throw AppException.unauthorized("Token inválido");
  }
}

export default jwtMiddleware;
