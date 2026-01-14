import type { SchemaObject } from "../openapi/types.js";
import type {
  FormatOpenApiResult,
  Method,
  Parameter,
  RequestBody,
  Route,
} from "../openapi/format.js";
import { toCapitalWord } from "../utils/to-capital-word.js";

let functionString = "";

function formatRouteName(route: string) {
  return route.split(/\/|:/).map(toCapitalWord).join("");
}

function formatFunctionName(route: Route, method: Method) {
  const formattedRoute = formatRouteName(route.route);

  return `${method.method}${formattedRoute}`;
}

function getFunctions(formatOpenApiResult: FormatOpenApiResult) {
  let functions: {
    fnName: string;
    params: Parameter[] | null;
    query: Parameter[] | null;
    body: RequestBody | null;
  }[] = [];

  for (const route of formatOpenApiResult.routes) {
    for (const method of route.methods) {
      const fnName = formatFunctionName(route, method);
      functions.push({
        fnName,
        params: method.parameters?.filter((p) => p.in === "path") || null,
        query: method.parameters?.filter((p) => p.in === "query") || null,
        body: method.requestBody || null,
      });
    }
  }

  functionString = functions
    .map((fn) => {
      const types: string[] = [];
      const serviceArgs: string[] = [];

      if (fn.params && fn.params.length > 0) {
        const typeName = toCapitalWord(fn.fnName) + "Params";
        const type = `type ${typeName} = {
  ${fn.params
    .map((p) => {
      let paramType = p.type;
      if (p.type == "integer" || p.type == "number") paramType = "number";
      if (p.type == "array") paramType += "[]";
      return `${p.name}: ${paramType};`;
    })
    .join("\n  ")}
}`;
        types.push(type);
        serviceArgs.push(`params: ${typeName}`);
      }

      if (fn.body) {
        const typeName = toCapitalWord(fn.fnName) + "Body";
        const type = `type ${typeName} = {
  ${fn.body}
}`;
        types.push(type);
        serviceArgs.push(`body: ${typeName}`);
      }

      if (fn.query && fn.query.length > 0) {
        console.log(fn.query);
        const typeName = toCapitalWord(fn.fnName) + "Query";
        const type = `type ${typeName} = {
  ${fn.query
    .map((q) => {
      let paramType = q.type;
      if (q.type == "integer" || q.type == "number") paramType = "number";
      if (q.type == "array") paramType += "[]";
      return `${q.name}: ${paramType};`;
    })
    .join("\n  ")}
}`;
        types.push(type);
        serviceArgs.push(`query: ${typeName}`);
      }

      const serviceString = serviceArgs.join(", ");

      return `${types.join("\n")}
async function ${fn.fnName}(${serviceString}) {
  return null;
}`;
    })
    .join("\n\n");
}

export function moduleServiceTemplate(
  formatOpenApiResult: FormatOpenApiResult
) {
  getFunctions(formatOpenApiResult);

  return `${functionString}

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
