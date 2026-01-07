import { AppException } from "@/shared/api-exception.js";
import { AxiosError } from "axios";
import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

export function errorHandler(
  error: FastifyError | AxiosError | Error,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  // Erros conhecidos da aplicação
  if (error instanceof AppException) {
    return reply.status(error.statusCode).send({
      status: error.statusCode,
      message: error.message,
      response: null,
      code: error.code,
    });
  }

  // Erros de validação (Zod / Fastify)
  if ((error as FastifyError).validation) {
    return reply.status(400).send({
      status: 400,
      message: "Dados Inválidos",
      response: (error as FastifyError).validation,
    });
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      status: 400,
      message: "Dados inválidos",
      response: JSON.parse(error.message),
    });
  }

  if (error instanceof AxiosError) {
    return reply.status(error.response?.status || 500).send({
      status: error.response?.status || 500,
      message: error.response?.data.message || "Erro de API Externa",
      response: error.response?.data,
    });
  }

  return reply.status(500).send({
    status: 500,
    message: "Erro interno do servidor",
    response: error,
  });
}
