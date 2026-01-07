import "reflect-metadata";
import Fastify from "fastify";
import { ENV } from "@config/env.js";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import mainRouter from "@/routes.js";
import { AppDataSource } from "@database/data-source.js";
import { errorHandler } from "./helpers/error-handler.js";

Fastify({
  logger: true,
})
  .withTypeProvider<ZodTypeProvider>()
  .setValidatorCompiler(validatorCompiler)
  .setSerializerCompiler(serializerCompiler)
  .setErrorHandler(errorHandler)
  .register(mainRouter)
  .listen({ port: ENV.PORT });
await AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log("Error connecting to database", err);
  });
