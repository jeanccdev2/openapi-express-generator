import type { HttpMethod, OpenApiDocument } from "./types.js";
import type { SchemaObject } from "./types.js";

export function formatRequestBody(
  openapi: OpenApiDocument,
  schema: SchemaObject | null
): RequestBody | null {
  if (!schema) return null;
  if (schema.$ref) {
    const schemaName = schema.$ref.replace("#/components/schemas/", "");
    schema = openapi?.components?.schemas?.[schemaName] || null;
    if (schema) schema.name = schemaName;
  }

  if (!schema) return null;
  const body = mapSchemaType(schema);

  return body;
}

function mapSchemaType(schema: SchemaObject): RequestBody | null {
  switch (schema.type) {
    case "integer":
    case "number":
      return { type: "number", description: schema.description || "" };
    case "boolean":
      return { type: "boolean", description: schema.description || "" };
    case "object":
      return mapObjectSchemaType(schema);
    // case "array":
    //   return { type: "array", items: mapSchemaType(schema.items!) };
    default:
      return { type: "string", description: schema.description || "" };
  }
}

function mapObjectSchemaType(schema: SchemaObject): ObjectRequestBody | null {
  if (schema.type !== "object") return null;

  const properties = schema.properties || {};
  let mappedProperties: any = {};
  for (const property in properties) {
    mappedProperties[property] = mapSchemaType(properties[property]!);
  }

  return {
    name: schema.name,
    type: schema.type,
    required: schema.required || [],
    properties: mappedProperties,
    ref: schema.$ref,
  };
}

type GenericRequestBody = {
  type: "boolean" | "integer" | "number" | "string";
  description: string;
};

export type ObjectRequestBody = {
  name?: string;
  type: "object";
  required: string[];
  properties: Record<string, RequestBody>;
  ref?: string;
};

type ArrayRequestBody = {
  type: "array";
  items: RequestBody;
};

export type RequestBody =
  | GenericRequestBody
  | ObjectRequestBody
  | ArrayRequestBody;

export type Parameter = {
  name: string;
  in: "query" | "header" | "path" | "cookie";
  type: "string" | "number" | "integer" | "boolean" | "array" | "object";
  required: boolean;
};

export type Method = {
  method: HttpMethod;
  jwt?: boolean;
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

        const formattedRequestBody = formatRequestBody(
          openapi,
          requestBody?.content?.["application/json"]?.schema ?? null
        );

        const mappedParameter: Parameter[] | null =
          parameters?.map((parameter) => ({
            name: parameter.name,
            in: parameter.in,
            type: parameter.schema?.type ?? "string",
            required: parameter.required ?? false,
          })) ?? null;

        newRoute.methods.push({
          method,
          jwt: !!operation.security?.[0]?.BearerAuth,
          parameters: mappedParameter,
          requestBody: formattedRequestBody,
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
