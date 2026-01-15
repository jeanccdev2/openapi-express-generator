import { toCapitalWord } from "../utils/to-capital-word.js";
import {
  formatRequestBody,
  type FormatOpenApiResult,
  type ObjectRequestBody,
} from "../openapi/format.js";
import { type ColumnType } from "typeorm";
import type { OpenApiDocument } from "../openapi/types.js";

type PrimaryTypes = "increment" | "uuid" | "rowid" | "identity";
type Column = {
  type?: ColumnType | undefined;
  primary?: PrimaryTypes;
  nullable?: boolean;
  length?: number;
  name?: string;
  default?: any;
  unique?: boolean;
};
let columnsString = "";

function generateColumns(columns: Column[]) {
  console.log("columns", columns);
  columnsString = columns
    .filter((column) => !!column.name)
    .map((column) => {
      let tsType = "string";
      switch (column.type) {
        default:
          tsType = "string";
      }
      if (column.primary) {
        switch (column.primary) {
          case "increment":
          case "identity":
            return ` @PrimaryGeneratedColumn("${column.primary}", { type: "${
              column.type || "string"
            }" })\n ${column.name}!: ${tsType};`;
          case "uuid":
            return ` @PrimaryGeneratedColumn("${column.primary}")\n ${column.name}!: string;`;
          case "rowid":
            return ` @PrimaryGeneratedColumn("${column.primary}")\n ${column.name}!: number;`;
        }
      }

      const nullable = column.nullable ?? false;
      const length = column.length ?? 255;
      const name = column.name || undefined;
      const defaultVal = column.default ?? undefined;
      const unique = column.unique ?? false;

      return ` @Column({ type: "${
        column.type || "string"
      }", nullable: ${nullable}, length: ${length}, unique: ${unique}${
        name ? `, name: "${name}"` : ""
      }${defaultVal ? `, default: "${defaultVal}",` : ""} })\n ${
        column.name
      }!: ${tsType};`;
    })
    .join("\n\n");

  console.log("columnsString", columnsString);
}
function getColumns(entity: ObjectRequestBody): Column[] {
  const columns: Column[] = [];

  for (const propName in entity.properties) {
    const prop = entity.properties[propName]!;
    if (prop.type === "object" || prop.type === "array") {
      continue;
    }
    console.log("prop", prop);
    const arrayDescription = prop.description.split("_");
    let type: ColumnType | undefined = (
      arrayDescription.find((item) => item.startsWith("type:")) || undefined
    )?.replace("type:", "") as ColumnType | undefined;
    const primary = arrayDescription
      .find((item) => item.startsWith("pk:"))
      ?.replace("pk:", "") as PrimaryTypes | undefined;
    if (primary) {
      switch (primary) {
        case "increment":
          type = "integer";
          break;
        case "identity":
          type = "integer";
          break;
        default:
          type = undefined;
          break;
      }
    }
    const nullable = arrayDescription.includes("nullable");
    const length = Number(
      (
        arrayDescription.find((item) => item.startsWith("length:")) ||
        "length:255"
      )?.replace("length:", "")
    );
    const name = arrayDescription
      .find((item) => item.startsWith("name:"))
      ?.replace("name:", "");
    const defaultVal = arrayDescription
      .find((item) => item.startsWith("default:"))
      ?.replace("default:", "");
    const unique = arrayDescription.includes("unique");

    const column: Column = {
      type,
      primary,
      nullable,
      length,
      name,
      default: defaultVal,
      unique,
    };

    console.log(column);

    columns.push(column);
  }

  return columns;
}

function getEntities(module: string, openapi: OpenApiDocument) {
  const entities: ObjectRequestBody[] = [];

  for (const schemaName in openapi.components?.schemas || {}) {
    const schemaObject = openapi.components?.schemas?.[schemaName];
    if (
      schemaObject &&
      schemaObject.type === "object" &&
      schemaName.endsWith("Entity") &&
      schemaObject.description?.includes(`module:${module}`)
    ) {
      const requestBodyFormatted = formatRequestBody(openapi, schemaObject);
      if (requestBodyFormatted && requestBodyFormatted.type === "object") {
        entities.push({ ...requestBodyFormatted, name: schemaName });
      }
    }
  }

  return entities;
}
export function moduleEntityTypeormTemplate(
  formatOpenApiResult: FormatOpenApiResult,
  openapi: OpenApiDocument
) {
  const { module } = formatOpenApiResult;
  const capitalModule = toCapitalWord(module);
  const entities = getEntities(formatOpenApiResult.module, openapi);
  const columns: Column[] = [];
  for (const entity of entities) {
    columns.push(...getColumns(entity));
  }

  generateColumns(columns);

  return `import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, type DeepPartial } from "typeorm";

@Entity("${module}")
export class ${capitalModule}Entity extends BaseEntity {
${columnsString}
}

export type Create${capitalModule}Entity = DeepPartial<${capitalModule}Entity>;

export type Update${capitalModule}Entity = Partial<Create${capitalModule}Entity>;

`;
}
