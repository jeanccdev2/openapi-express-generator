import type { FormatOpenApiResult, Method, Route } from "../openapi/format.js";

function formatRouteName(route: string) {
  return route
    .split(/\/|:/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function formatSchemaName(route: Route, method: Method) {
  const formattedRoute = formatRouteName(route.route);

  return `${method.method}${formattedRoute}Schema`;
}

function getSchemas(formatOpenApiResult: FormatOpenApiResult) {
  const { module } = formatOpenApiResult;
  let schemas = "";

  for (const route of formatOpenApiResult.routes) {
    for (const method of route.methods) {
      schemas += ` ${formatSchemaName(route, method)}${
        route.methods.indexOf(method) === route.methods.length - 1 &&
        formatOpenApiResult.routes.indexOf(route) ===
          formatOpenApiResult.routes.length - 1
          ? ""
          : ","
      }`;
    }
  }

  return `import {${schemas} } from "@${module}/schemas/${module}.schema.js";`;
}

function getController(formatOpenApiResult: FormatOpenApiResult) {
  const { module } = formatOpenApiResult;

  return `import ${module}Controller from "@${module}/controllers/${module}.controller.js";`;
}

function getRoutes(formatOpenApiResult: FormatOpenApiResult) {
  const { module } = formatOpenApiResult;
  let routes = "";

  for (const route of formatOpenApiResult.routes) {
    for (const method of route.methods) {
      const formattedSchemaName = formatSchemaName(route, method);
      const formattedRouteName = formatRouteName(route.route);
      routes += `  app.${method.method}("${route.route}", ${formattedSchemaName}, ${module}Controller.${method.method}${formattedRouteName});\n`;
    }
  }

  return `const ${module}Router: FastifyPluginAsyncZod = async (app) => {
${routes}
};`;
}

export function indexRoutesTemplate(formatOpenApiResult: FormatOpenApiResult) {
  return `import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
${getSchemas(formatOpenApiResult)}
${getController(formatOpenApiResult)}

${getRoutes(formatOpenApiResult)}

export default ${formatOpenApiResult.module}Router;
`;
}
