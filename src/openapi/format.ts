import type { HttpMethod, OpenApiDocument } from "./types.js";

type RequestBody = {};

export type Parameter = {
  name: string;
  in: "query" | "header" | "path" | "cookie";
  type: "string" | "number" | "integer" | "boolean" | "array" | "object";
  required: boolean;
};

export type Method = {
  method: HttpMethod;
  parameters: Parameter[] | null;
  requestBody: RequestBody | null;
};

export type Route = {
  route: string;
  methods: Method[];
};

export type FormatOpenApiResult = {
  module: string;
  routes: Route[];
};

export function formatOpenApi(
  openapi: OpenApiDocument,
  modules: string[]
): FormatOpenApiResult[] {
  const finalRoutes: FormatOpenApiResult[] = [];
  for (const module of modules) {
    const moduleRoutes: Route[] = [];
    const routes = Object.keys(openapi.paths).filter((path) =>
      path.startsWith(`/${module}`)
    );
    for (const route of routes) {
      const formattedRoute = route.replace(/\{/g, ":").replace(/\}/g, "");
      const newRoute: Route = {
        route: formattedRoute,
        methods: [],
      };

      const pathItem = openapi.paths[route]!;

      const methods = Object.keys(pathItem) as HttpMethod[];
      for (const method of methods) {
        const operation = pathItem[method];
        if (!operation) continue;

        const { parameters = null, requestBody = null } = operation;
        const mappedParameter: Parameter[] | null =
          parameters?.map((parameter) => ({
            name: parameter.name,
            in: parameter.in,
            type: parameter.schema?.type ?? "string",
            required: parameter.required ?? false,
          })) ?? null;
        newRoute.methods.push({
          method,
          parameters: mappedParameter,
          requestBody,
        });
      }
      moduleRoutes.push(newRoute);
    }
    finalRoutes.push({
      module,
      routes: moduleRoutes,
    });
  }

  return finalRoutes;
}
