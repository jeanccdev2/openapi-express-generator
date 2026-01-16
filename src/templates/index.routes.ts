import { toCapitalWord } from "../utils/to-capital-word.js";
import type { FormatOpenApiResult, Method, Route } from "../openapi/format.js";

function formatRouteName(route: string) {
  return route.split(/\/|:/).map(toCapitalWord).join("");
}

function formatSchemaName(route: Route, method: Method) {
  const formattedRoute = formatRouteName(route.route);

  return `${method.method}${formattedRoute}Schema`;
}

function getSchemas(formatOpenApiResult: FormatOpenApiResult) {
  const { module } = formatOpenApiResult;
  let schemas = [];

  for (const route of formatOpenApiResult.routes) {
    for (const method of route.methods) {
      schemas.push(`${formatSchemaName(route, method)}`);
    }
  }

  return schemas
    .map(
      (schema) =>
        `import { ${schema} } from "@${module}/schemas/${schema}.schema.js";`
    )
    .join("\n");
}

function getController(formatOpenApiResult: FormatOpenApiResult) {
  const { module } = formatOpenApiResult;

  return `import ${module}Controller from "@${module}/controllers/${module}.controller.js";`;
}

function getRoutes(formatOpenApiResult: FormatOpenApiResult) {
  const { module } = formatOpenApiResult;
  let routes = [];

  for (const route of formatOpenApiResult.routes) {
    for (const method of route.methods) {
      const formattedSchemaName = formatSchemaName(route, method);
      const formattedRouteName = formatRouteName(route.route);
      const jwt = method.jwt ? ", jwt" : "";
      routes.push(
        `  app.${method.method}("${
          route.route
        }", { ...${formattedSchemaName}, preHandler: [${
          jwt ? "jwtMiddleware" : ""
        }] }, ${module}Controller.${method.method}${formattedRouteName});`
      );
    }
  }

  return `const ${module}Router: FastifyPluginAsyncZod = async (app) => {
${routes.join("\n")}
};`;
}

export function indexRoutesTemplate(formatOpenApiResult: FormatOpenApiResult) {
  return `import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import jwtMiddleware from "@/shared/jwt-middleware.js";
${getSchemas(formatOpenApiResult)}
${getController(formatOpenApiResult)}

${getRoutes(formatOpenApiResult)}

export default ${formatOpenApiResult.module}Router;
`;
}
