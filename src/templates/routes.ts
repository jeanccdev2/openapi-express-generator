export function mainRouterTemplate(modules: string[]) {
  return `${modules
  .map((module) => `import ${module} from "@${module}/index.routes.js";`)
  .join("\n")}
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

const mainRouter: FastifyPluginAsyncZod = async (app) => {
${modules
    .map(
      (module) => ` await app.register(${module}, {
    prefix: "/${module}",
  });`
    )
    .join("\n")}
};

export default mainRouter;`;
}
