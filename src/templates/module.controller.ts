import type {
  FormatOpenApiResult,
  Method,
  Parameter,
  Route,
} from "../openapi/format.js";
import { toCapitalWord } from "../utils/to-capital-word.js";

let schemaString = "";
let functionString = "";

function formatRouteName(route: string) {
  return route.split(/\/|:/).map(toCapitalWord).join("");
}

function formatSchemaName(
  route: Route,
  method: Method,
  capitalMethod?: boolean
) {
  const formattedRoute = formatRouteName(route.route);

  return `${
    capitalMethod ? toCapitalWord(method.method) : method.method
  }${formattedRoute}Schema`;
}

function getSchemas(formatOpenApiResult: FormatOpenApiResult) {
  const { module } = formatOpenApiResult;
  let schemas = [];

  for (const route of formatOpenApiResult.routes) {
    for (const method of route.methods) {
      schemas.push({
        type: formatSchemaName(route, method, true),
        fileName: formatSchemaName(route, method),
      });
    }
  }

  schemaString = schemas
    .map(
      (schema) =>
        `import { ${schema.type} } from "@${module}/schemas/${schema.fileName}.schema.js";`
    )
    .join("\n");

  return schemas;
}

function getFunctions(formatOpenApiResult: FormatOpenApiResult) {
  const { module } = formatOpenApiResult;
  let functions: {
    fnName: string;
    schemaName: string;
    hasParams: boolean;
    hasQuery: boolean;
    hasBody: boolean;
    response: {
      statusCode: number;
      message: string;
    };
  }[] = [];

  for (const route of formatOpenApiResult.routes) {
    for (const method of route.methods) {
      const formattedRouteName = formatRouteName(route.route);
      const fnName = `${method.method}${formattedRouteName}`;
      functions.push({
        fnName,
        schemaName: formatSchemaName(route, method, true),
        hasParams: Boolean(method.parameters?.filter((p) => p.in === "path")),
        hasQuery: Boolean(method.parameters?.filter((p) => p.in === "query")),
        hasBody: Boolean(method.requestBody),
        response: {
          statusCode:
            method.method === "post"
              ? 201
              : method.method === "delete"
              ? 200
              : 200,
          message: "Sucesso",
        },
      });
    }
  }

  functionString = functions
    .map((fn) => {
      const lines: string[] = [];
      const serviceArgs: string[] = [];

      if (fn.hasParams) {
        serviceArgs.push("req.params");
      }

      if (fn.hasBody) {
        serviceArgs.push("req.body");
      }

      if (fn.hasQuery) {
        serviceArgs.push("req.query");
      }

      return `async function ${fn.fnName}(req: FastifyRequest<${
        fn.schemaName
      }>) {
${lines.join("\n")}${lines.length ? "\n" : ""}  return new ApiResponse(
    ${fn.response.statusCode},
    "${fn.response.message}",
    await ${module}Service.${fn.fnName}(${serviceArgs.join(", ")}),
  );
}`;
    })
    .join("\n\n");
}

export function moduleControllerTemplate(
  formatOpenApiResult: FormatOpenApiResult
) {
  const { module } = formatOpenApiResult;
  getSchemas(formatOpenApiResult);
  getFunctions(formatOpenApiResult);

  return `import type { FastifyRequest } from "fastify";
${schemaString}
import { ApiResponse } from "@/shared/api-response.js";
import ${module}Service from "@${module}/services/${module}.service.js";

${functionString}

export default {
${formatOpenApiResult.routes
  .flatMap((route) =>
    route.methods.map((method) => {
      const fnName = `${method.method}${formatRouteName(route.route)}`;
      return `  ${fnName},`;
    })
  )
  .join("\n")}
};
`;
}
