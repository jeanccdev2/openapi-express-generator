import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
  deleteExampleSchema,
  getExampleSchema,
  postExampleSchema,
  updateExampleSchema,
} from "@example/schemas/postExample.schema.js";
import exampleController from "@example/controllers/example.controller.js";
import jwtMiddleware from "@/shared/jwt-middleware.js";

const exampleRouter: FastifyPluginAsyncZod = async (app) => {
  app.get<import("@example/schemas/postExample.schema.js").GetExampleSchema>(
    "/:id",
    { ...getExampleSchema, preHandler: [jwtMiddleware] },
    exampleController.getExample,
  );
  app.post<import("@example/schemas/postExample.schema.js").PostExampleSchema>(
    "/",
    { ...postExampleSchema, preHandler: [jwtMiddleware] },
    exampleController.postExample,
  );
  app.put<import("@example/schemas/postExample.schema.js").UpdateExampleSchema>(
    "/:id",
    { ...updateExampleSchema, preHandler: [jwtMiddleware] },
    exampleController.updateExample,
  );
  app.delete<import("@example/schemas/postExample.schema.js").DeleteExampleSchema>(
    "/:id",
    { ...deleteExampleSchema, preHandler: [jwtMiddleware] },
    exampleController.deleteExample,
  );
};

export default exampleRouter;
