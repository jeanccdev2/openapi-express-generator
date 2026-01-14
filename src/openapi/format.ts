import type { HttpMethod, OpenApiDocument } from "./types.js";
import type { RequestBodyObject, SchemaObject } from "./types.js";

function formatRequestBody(
  openapi: OpenApiDocument,
  requestBody: RequestBodyObject | null
): RequestBody | null {
  if (!requestBody) return null;
  const json = requestBody.content?.["application/json"];
  if (!json?.schema) return null;

  let schema: SchemaObject | null = json.schema;
  if (schema.$ref) {
    const splitRef = schema.$ref
      .replace("#/components/schemas/", "")
      .split("/");
    schema = openapi?.components?.schemas?.[splitRef.join("/")] || null;
  }

  if (!schema) return null;

  const body = mapSchemaType(schema);

  return body;
}

function mapObjectSchemaType(schema: SchemaObject): ObjectRequestBody | null {
  if (schema.type !== "object") return null;

  const properties = schema.properties || {};
  let mappedProperties: any = {};
  for (const property in properties) {
    mappedProperties[property] = mapSchemaType(properties[property]!);
  }

  return {
    type: schema.type,
    required: schema.required || [],
    properties: mappedProperties,
  };
}

function mapSchemaType(schema: SchemaObject): RequestBody | null {
  switch (schema.type) {
    case "integer":
    case "number":
      return { type: "number" };
    case "boolean":
      return { type: "boolean" };
    case "object":
      return mapObjectSchemaType(schema);
    // case "array":
    //   return { type: "array", items: mapSchemaType(schema.items!) };
    default:
      return { type: "string" };
  }
}

type GenericRequestBody = {
  type: "boolean" | "integer" | "number" | "string";
};

type ObjectRequestBody = {
  type: "object";
  required: string[];
  properties: Record<string, RequestBody>;
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

        const formattedRequestBody = formatRequestBody(openapi, requestBody);

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
