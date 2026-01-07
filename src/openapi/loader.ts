import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

import type { OpenApiDocument } from "./types.js";

export class OpenApiReadError extends Error {
  public readonly filePath: string;

  constructor(
    message: string,
    filePath: string,
    options?: { cause?: unknown }
  ) {
    super(message, options);
    this.name = "OpenApiReadError";
    this.filePath = filePath;
  }
}

export class OpenApiValidationError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "OpenApiValidationError";
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateOpenApiDocument(
  doc: unknown
): asserts doc is OpenApiDocument {
  if (!isPlainObject(doc)) {
    throw new OpenApiValidationError(
      "OpenAPI inválido: documento não é um objeto"
    );
  }

  const openapi = doc.openapi;
  if (typeof openapi !== "string" || !openapi.startsWith("3.")) {
    throw new OpenApiValidationError(
      'OpenAPI inválido: campo "openapi" ausente ou não é versão 3.x'
    );
  }

  const info = doc.info;
  if (!isPlainObject(info)) {
    throw new OpenApiValidationError('OpenAPI inválido: campo "info" ausente');
  }

  if (typeof info.title !== "string" || typeof info.version !== "string") {
    throw new OpenApiValidationError(
      'OpenAPI inválido: "info.title" e "info.version" são obrigatórios'
    );
  }

  const paths = doc.paths;
  if (!isPlainObject(paths)) {
    throw new OpenApiValidationError('OpenAPI inválido: campo "paths" ausente');
  }
}

export async function readOpenApiFile(
  filePath: string
): Promise<OpenApiDocument> {
  const absPath = path.resolve(filePath);
  let raw: string;

  try {
    raw = await fs.readFile(absPath, "utf-8");
  } catch (err) {
    throw new OpenApiReadError("Não foi possível ler o arquivo", absPath, {
      cause: err,
    });
  }

  const ext = path.extname(absPath).toLowerCase();
  let parsed: unknown;

  try {
    if (ext === ".json") {
      parsed = JSON.parse(raw);
    } else if (ext === ".yaml" || ext === ".yml") {
      parsed = YAML.parse(raw);
    } else {
      throw new OpenApiReadError(
        "Extensão de arquivo não suportada. Use .json, .yaml ou .yml",
        absPath
      );
    }
  } catch (err) {
    if (err instanceof OpenApiReadError) throw err;
    throw new OpenApiReadError(
      "Não foi possível interpretar o arquivo OpenAPI",
      absPath,
      {
        cause: err,
      }
    );
  }

  validateOpenApiDocument(parsed);
  return parsed;
}
