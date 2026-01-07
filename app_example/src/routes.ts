import exampleRouter from "@example/index.routes.js";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

const mainRouter: FastifyPluginAsyncZod = async (app) => {
  await app.register(exampleRouter, {
    prefix: "/example",
  });
};

export default mainRouter;
