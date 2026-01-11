import type { OpenApiDocument } from "src/openapi/types.js";
import type { GenerateProjectOptions } from "../commands/generate.command.js";
import { readOpenApiFile } from "../openapi/loader.js";

function generateRoutes(openapi: OpenApiDocument) {
    
}

export async function generateFlow(options: GenerateProjectOptions) {
  try {
    const openapi = await readOpenApiFile(options.file_path);
    generateRoutes(openapi);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(message);
  }
}
