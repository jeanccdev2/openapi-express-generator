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
    parameters: Parameter[];
    response: {
      statusCode: number;
      message: string;
    };
  }[] = [];

  functionString = functions
    .map(
      (fn) =>
        `async function ${fn.fnName}(req: FastifyRequest<${fn.schemaName}>) {
  return new ApiResponse(
    ${fn.response.statusCode},
    "${fn.response.message}",
    await ${module}Service.${fn.fnName}(req.body),
  );
}`
    )
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

async function getExample(req: FastifyRequest<GetExampleSchema>) {
  const id = Number(req.params.id);
  return new ApiResponse(
    200,
    "Exemplo encontrado com sucesso",
    await exampleService.getExample(id),
  );
}

async function postExample(req: FastifyRequest<PostExampleSchema>) {
  return new ApiResponse(
    201,
    "Exemplo criado com sucesso",
    await exampleService.postExample(req.body),
  );
}

async function updateExample(req: FastifyRequest<UpdateExampleSchema>) {
  const id = Number(req.params.id);
  return new ApiResponse(
    201,
    "Exemplo atualizado com sucesso",
    await exampleService.updateExample(id, req.body),
  );
}

async function deleteExample(req: FastifyRequest<DeleteExampleSchema>) {
  const id = Number(req.params.id);
  return new ApiResponse(
    201,
    "Exemplo deletado com sucesso",
    await exampleService.deleteExample(id),
  );
}

export default {
  getExample,
  postExample,
  updateExample,
  deleteExample,
};
`;
}
