type Routes = {
  method: "get" | "post" | "put" | "delete";
  path: string;
  module: string;
  name: string;
};

export function indexRoutesTemplate(routes: Routes[]) {
  const module = routes && routes.length > 0 ? routes[0]?.module : "";
  routes.map((route) => ({
    ...route,
    name: route.name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(""),
  }));

  return `import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
  ${routes.map((route) => `${route.method}${route.name}Schema`).join(", ")}
} from "@${module}/schemas/postExample.schema.js";
import Controller from "@${module}/controllers/example.controller.js";

const exampleRouter: FastifyPluginAsyncZod = async (app) => {${routes.map(
    (route) =>
      `\n app.${route.method}("${route.path}", ${route.method}${route.name}Schema, ${route.method}Controller.${route.method}${route.name});`
  )}
};

export default exampleRouter;
`;
}
