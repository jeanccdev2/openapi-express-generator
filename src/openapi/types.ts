export type OpenApiDocument = {
  openapi: string;

  info: InfoObject;

  servers?: ServerObject[];

  paths: PathsObject;

  components?: ComponentsObject;

  security?: SecurityRequirementObject[];

  tags?: TagObject[];

  externalDocs?: ExternalDocumentationObject;

  [extension: `x-${string}`]: unknown;
};

/* ================= INFO ================= */

export type InfoObject = {
  title: string;
  description?: string;
  termsOfService?: string;
  version: string;
  contact?: ContactObject;
  license?: LicenseObject;
};

export type ContactObject = {
  name?: string;
  url?: string;
  email?: string;
};

export type LicenseObject = {
  name: string;
  url?: string;
};

/* ================= SERVERS ================= */

export type ServerObject = {
  url: string;
  description?: string;
  variables?: Record<string, ServerVariableObject>;
};

export type ServerVariableObject = {
  enum?: string[];
  default: string;
  description?: string;
};

/* ================= PATHS ================= */

export type PathsObject = {
  [path: string]: PathItemObject;
};

export type PathItemObject = {
  get?: OperationObject;
  put?: OperationObject;
  post?: OperationObject;
  delete?: OperationObject;
  options?: OperationObject;
  head?: OperationObject;
  patch?: OperationObject;
  trace?: OperationObject;

  parameters?: ParameterObject[];

  summary?: string;
  description?: string;

  [extension: `x-${string}`]: unknown;
};

/* ================= OPERATIONS ================= */

export type OperationObject = {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string;

  parameters?: ParameterObject[];

  requestBody?: RequestBodyObject;

  responses: ResponsesObject;

  deprecated?: boolean;

  security?: SecurityRequirementObject[];

  [extension: `x-${string}`]: unknown;
};

/* ================= PARAMETERS ================= */

export type ParameterObject = {
  name: string;
  in: "query" | "header" | "path" | "cookie";
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;

  schema?: SchemaObject;
  example?: unknown;
  examples?: Record<string, ExampleObject>;
};

/* ================= REQUEST / RESPONSE ================= */

export type RequestBodyObject = {
  description?: string;
  content: ContentObject;
  required?: boolean;
};

export type ResponsesObject = {
  [statusCode: string]: ResponseObject;
};

export type ResponseObject = {
  description: string;
  headers?: Record<string, HeaderObject>;
  content?: ContentObject;
};

/* ================= CONTENT ================= */

export type ContentObject = {
  [mediaType: string]: MediaTypeObject;
};

export type MediaTypeObject = {
  schema?: SchemaObject;
  example?: unknown;
  examples?: Record<string, ExampleObject>;
};

/* ================= HEADERS ================= */

export type HeaderObject = Omit<ParameterObject, "name" | "in">;

/* ================= SCHEMAS ================= */

export type SchemaObject = {
  type?: "string" | "number" | "integer" | "boolean" | "array" | "object";
  format?: string;

  properties?: Record<string, SchemaObject>;
  items?: SchemaObject;

  required?: string[];
  nullable?: boolean;

  enum?: unknown[];
  default?: unknown;
  example?: unknown;

  oneOf?: SchemaObject[];
  anyOf?: SchemaObject[];
  allOf?: SchemaObject[];

  additionalProperties?: boolean | SchemaObject;

  description?: string;

  $ref?: string;
};

/* ================= COMPONENTS ================= */

export type ComponentsObject = {
  schemas?: Record<string, SchemaObject>;
  responses?: Record<string, ResponseObject>;
  parameters?: Record<string, ParameterObject>;
  requestBodies?: Record<string, RequestBodyObject>;
  headers?: Record<string, HeaderObject>;
  examples?: Record<string, ExampleObject>;
  securitySchemes?: Record<string, SecuritySchemeObject>;
};

/* ================= SECURITY ================= */

export type SecurityRequirementObject = {
  [securityScheme: string]: string[];
};

export type SecuritySchemeObject = {
  type: "apiKey" | "http" | "oauth2" | "openIdConnect";
  description?: string;

  name?: string;
  in?: "query" | "header" | "cookie";

  scheme?: string;
  bearerFormat?: string;

  flows?: OAuthFlowsObject;
  openIdConnectUrl?: string;
};

export type OAuthFlowsObject = {
  implicit?: OAuthFlowObject;
  password?: OAuthFlowObject;
  clientCredentials?: OAuthFlowObject;
  authorizationCode?: OAuthFlowObject;
};

export type OAuthFlowObject = {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: Record<string, string>;
};

/* ================= MISC ================= */

export type ExampleObject = {
  summary?: string;
  description?: string;
  value?: unknown;
};

export type TagObject = {
  name: string;
  description?: string;
  externalDocs?: ExternalDocumentationObject;
};

export type ExternalDocumentationObject = {
  description?: string;
  url: string;
};
