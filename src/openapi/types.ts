export type OpenApiDocument = {
  openapi: string;
  info: {
    title: string;
    version: string;
    [key: string]: unknown;
  };
  paths: Record<string, unknown>;
  [key: string]: unknown;
};
