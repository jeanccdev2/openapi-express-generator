import "reflect-metadata";
import Fastify from "fastify";
import { ENV } from "@config/env.js";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import mainRouter from "@/routes.js";
import { errorHandler } from "./helpers/error-handler.js";
import { initDatabase } from "./database/database.js";

Fastify({
  logger: true,
})
  .withTypeProvider<ZodTypeProvider>()
  .setValidatorCompiler(validatorCompiler)
  .setSerializerCompiler(serializerCompiler)
  .setErrorHandler(errorHandler)
  .register(mainRouter)
  .listen({ port: ENV.PORT });

initDatabase();
