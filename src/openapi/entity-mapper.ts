import type { OpenApiDocument, SchemaObject } from "./types.js";

/**
 * Representa uma entidade mapeada do OpenAPI
 */
export type EntitySchema = {
  name: string;
  originalName: string;
  schema: SchemaObject;
  properties: EntityProperty[];
};

/**
 * Representa uma propriedade de uma entidade
 */
export type EntityProperty = {
  name: string;
  type: string;
  required: boolean;
  nullable?: boolean;
  format?: string;
  description?: string;
  isArray?: boolean;
  isObject?: boolean;
  nestedProperties?: EntityProperty[];
  enum?: unknown[];
  default?: unknown;
  example?: unknown;
};

/**
 * Mapeia o tipo do OpenAPI para tipos TypeScript/JavaScript
 */
function mapOpenApiTypeToJsType(schema: SchemaObject): string {
  if (schema.$ref) {
    // Extrai o nome do schema da referência
    const refParts = schema.$ref.split("/");
    return refParts[refParts.length - 1] || "any";
  }

  if (schema.enum) {
    return "enum";
  }

  switch (schema.type) {
    case "string":
      if (schema.format === "date" || schema.format === "date-time") {
        return "Date";
      }
      return "string";
    case "number":
    case "integer":
      return "number";
    case "boolean":
      return "boolean";
    case "array":
      if (schema.items) {
        const itemType = mapOpenApiTypeToJsType(schema.items);
        return `${itemType}[]`;
      }
      return "any[]";
    case "object":
      return "object";
    default:
      return "any";
  }
}

/**
 * Processa as propriedades de um schema recursivamente
 */
function processSchemaProperties(
  schema: SchemaObject,
  requiredFields: string[] = []
): EntityProperty[] {
  const properties: EntityProperty[] = [];

  if (!schema.properties) {
    return properties;
  }

  for (const [propName, propSchema] of Object.entries(schema.properties)) {
    const isRequired = requiredFields.includes(propName);
    const isArray = propSchema.type === "array";
    const isObject = propSchema.type === "object";

    const property: EntityProperty = {
      name: propName,
      type: mapOpenApiTypeToJsType(propSchema),
      required: isRequired,
      nullable: propSchema.nullable,
      format: propSchema.format,
      description: propSchema.description,
      isArray,
      isObject,
      enum: propSchema.enum,
      default: propSchema.default,
      example: propSchema.example,
    };

    // Se for um objeto com propriedades aninhadas, processa recursivamente
    if (isObject && propSchema.properties) {
      property.nestedProperties = processSchemaProperties(
        propSchema,
        propSchema.required || []
      );
    }

    // Se for um array de objetos, processa o schema dos items
    if (isArray && propSchema.items?.type === "object" && propSchema.items.properties) {
      property.nestedProperties = processSchemaProperties(
        propSchema.items,
        propSchema.items.required || []
      );
    }

    properties.push(property);
  }

  return properties;
}

/**
 * Extrai todas as entidades (schemas que terminam com "Entity") do documento OpenAPI
 */
export function extractEntitiesFromOpenApi(
  doc: OpenApiDocument
): EntitySchema[] {
  const entities: EntitySchema[] = [];

  if (!doc.components?.schemas) {
    return entities;
  }

  for (const [schemaName, schema] of Object.entries(doc.components.schemas)) {
    // Verifica se o schema termina com "Entity"
    if (schemaName.endsWith("Entity")) {
      const entityName = schemaName.replace(/Entity$/, "");
      
      const entity: EntitySchema = {
        name: entityName,
        originalName: schemaName,
        schema,
        properties: processSchemaProperties(schema, schema.required || []),
      };

      entities.push(entity);
    }
  }

  return entities;
}

/**
 * Busca uma entidade específica pelo nome
 */
export function findEntityByName(
  doc: OpenApiDocument,
  entityName: string
): EntitySchema | null {
  const entities = extractEntitiesFromOpenApi(doc);
  return entities.find((e) => e.name === entityName || e.originalName === entityName) || null;
}

/**
 * Lista todos os nomes de entidades disponíveis
 */
export function listEntityNames(doc: OpenApiDocument): string[] {
  const entities = extractEntitiesFromOpenApi(doc);
  return entities.map((e) => e.originalName);
}
