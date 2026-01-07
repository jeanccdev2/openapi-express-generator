import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { getExampleSchema, postExampleSchema } from "@example/schemas/postExample.schema.js";
import exampleController from "@example/controllers/example.controller.js";

const exampleRouter: FastifyPluginAsyncZod = async (app) => {
  app.get("/:id", getExampleSchema, exampleController.getExample);
  app.post("/", postExampleSchema, exampleController.postExample);
};

export default exampleRouter;
