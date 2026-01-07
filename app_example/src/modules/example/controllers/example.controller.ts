import type { FastifyRequest } from "fastify";
import type { GetExampleSchema, PostExampleSchema } from "@example/schemas/postExample.schema.js";
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
  const { name } = req.body;
  return new ApiResponse(201, "Exemplo criado com sucesso", await exampleService.postExample(name));
}

export default {
  getExample,
  postExample,
};
