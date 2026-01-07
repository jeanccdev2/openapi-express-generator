import type { FastifyRequest } from "fastify";
import type {
  DeleteExampleSchema,
  GetExampleSchema,
  PostExampleSchema,
  UpdateExampleSchema,
} from "@example/schemas/postExample.schema.js";
import { ApiResponse } from "@/shared/api-response.js";
import exampleService from "../services/example.service.js";

async function getExample(req: FastifyRequest<GetExampleSchema>) {
  const id = Number(req.params.id);
  return new ApiResponse(
    200,
    "Exemplo encontrado com sucesso",
    await exampleService.getExample(id),
  );
}

async function postExample(req: FastifyRequest<PostExampleSchema>) {
  return new ApiResponse(
    201,
    "Exemplo criado com sucesso",
    await exampleService.postExample(req.body),
  );
}

async function updateExample(req: FastifyRequest<UpdateExampleSchema>) {
  const id = Number(req.params.id);
  return new ApiResponse(
    201,
    "Exemplo atualizado com sucesso",
    await exampleService.updateExample(id, req.body),
  );
}

async function deleteExample(req: FastifyRequest<DeleteExampleSchema>) {
  const id = Number(req.params.id);
  return new ApiResponse(
    201,
    "Exemplo deletado com sucesso",
    await exampleService.deleteExample(id),
  );
}

export default {
  getExample,
  postExample,
  updateExample,
  deleteExample,
};
