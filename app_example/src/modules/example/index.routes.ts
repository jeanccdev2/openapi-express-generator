import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
  deleteExampleSchema,
  getExampleSchema,
  postExampleSchema,
  updateExampleSchema,
} from "@example/schemas/postExample.schema.js";
import exampleController from "@example/controllers/example.controller.js";

const exampleRouter: FastifyPluginAsyncZod = async (app) => {
  app.get("/:id", getExampleSchema, exampleController.getExample);
  app.post("/", postExampleSchema, exampleController.postExample);
  app.put("/:id", updateExampleSchema, exampleController.updateExample);
  app.delete("/:id", deleteExampleSchema, exampleController.deleteExample);
};

export default exampleRouter;
