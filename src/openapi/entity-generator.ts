import type { EntitySchema, EntityProperty } from "./entity-mapper.js";

/**
 * Opções para geração de entidades
 */
export type EntityGeneratorOptions = {
  useClasses?: boolean; // Se true, gera classes; se false, gera interfaces
  includeValidation?: boolean; // Se true, inclui decorators de validação
  includeTypeOrm?: boolean; // Se true, inclui decorators do TypeORM
  exportType?: "default" | "named"; // Tipo de export
};

/**
 * Gera o tipo TypeScript para uma propriedade
 */
function generatePropertyType(property: EntityProperty): string {
  let type = property.type;

  // Se for um array, o tipo já vem formatado como "Type[]"
  if (property.isArray) {
    return type;
  }

  // Se for um enum, gera o union type
  if (property.enum && property.enum.length > 0) {
    const enumValues = property.enum
      .map((val) => (typeof val === "string" ? `"${val}"` : String(val)))
      .join(" | ");
    return enumValues;
  }

  // Se for nullable, adiciona | null
  if (property.nullable) {
    type = `${type} | null`;
  }

  return type;
}

/**
 * Gera decorators do TypeORM para uma propriedade
 */
function generateTypeOrmDecorators(property: EntityProperty, indent: string): string {
  const decorators: string[] = [];

  if (property.name === "id") {
    decorators.push(`${indent}@PrimaryGeneratedColumn()`);
    return decorators.join("\n");
  }

  const columnOptions: string[] = [];

  if (property.nullable) {
    columnOptions.push("nullable: true");
  }

  if (property.default !== undefined) {
    const defaultValue = typeof property.default === "string" 
      ? `"${property.default}"` 
      : String(property.default);
    columnOptions.push(`default: ${defaultValue}`);
  }

  if (property.type === "string" && property.format === "date-time") {
    columnOptions.push('type: "timestamp"');
  }

  if (property.type === "string" && property.format === "date") {
    columnOptions.push('type: "date"');
  }

  if (property.enum) {
    const enumValues = property.enum
      .map((val) => (typeof val === "string" ? `"${val}"` : String(val)))
      .join(", ");
    columnOptions.push(`type: "enum"`);
    columnOptions.push(`enum: [${enumValues}]`);
  }

  const optionsStr = columnOptions.length > 0 ? `{ ${columnOptions.join(", ")} }` : "";
  decorators.push(`${indent}@Column(${optionsStr})`);

  return decorators.join("\n");
}

/**
 * Gera decorators de validação para uma propriedade
 */
function generateValidationDecorators(property: EntityProperty, indent: string): string {
  const decorators: string[] = [];

  if (property.required) {
    decorators.push(`${indent}@IsNotEmpty()`);
  } else {
    decorators.push(`${indent}@IsOptional()`);
  }

  switch (property.type) {
    case "string":
      decorators.push(`${indent}@IsString()`);
      if (property.format === "email") {
        decorators.push(`${indent}@IsEmail()`);
      }
      if (property.format === "date" || property.format === "date-time") {
        decorators.push(`${indent}@IsDate()`);
      }
      break;
    case "number":
      decorators.push(`${indent}@IsNumber()`);
      break;
    case "boolean":
      decorators.push(`${indent}@IsBoolean()`);
      break;
  }

  if (property.isArray) {
    decorators.push(`${indent}@IsArray()`);
  }

  if (property.enum) {
    const enumValues = property.enum
      .map((val) => (typeof val === "string" ? `"${val}"` : String(val)))
      .join(", ");
    decorators.push(`${indent}@IsEnum([${enumValues}])`);
  }

  return decorators.join("\n");
}

/**
 * Gera o código de uma propriedade
 */
function generateProperty(
  property: EntityProperty,
  options: EntityGeneratorOptions,
  indent: string = "  "
): string {
  const lines: string[] = [];

  // Adiciona comentário de descrição se existir
  if (property.description) {
    lines.push(`${indent}/**`);
    lines.push(`${indent} * ${property.description}`);
    lines.push(`${indent} */`);
  }

  // Adiciona decorators do TypeORM
  if (options.includeTypeOrm) {
    lines.push(generateTypeOrmDecorators(property, indent));
  }

  // Adiciona decorators de validação
  if (options.includeValidation) {
    lines.push(generateValidationDecorators(property, indent));
  }

  // Gera a declaração da propriedade
  const propertyType = generatePropertyType(property);
  const optional = !property.required ? "?" : "";
  
  if (options.useClasses) {
    lines.push(`${indent}${property.name}${optional}: ${propertyType};`);
  } else {
    lines.push(`${indent}${property.name}${optional}: ${propertyType};`);
  }

  return lines.join("\n");
}

/**
 * Gera imports necessários
 */
function generateImports(options: EntityGeneratorOptions): string {
  const imports: string[] = [];

  if (options.includeTypeOrm) {
    imports.push(
      'import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";'
    );
  }

  if (options.includeValidation) {
    imports.push(
      'import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, IsEmail, IsDate, IsArray, IsEnum } from "class-validator";'
    );
  }

  return imports.length > 0 ? imports.join("\n") + "\n\n" : "";
}

/**
 * Gera o código completo de uma entidade
 */
export function generateEntityCode(
  entity: EntitySchema,
  options: EntityGeneratorOptions = {}
): string {
  const {
    useClasses = true,
    includeValidation = false,
    includeTypeOrm = false,
    exportType = "named",
  } = options;

  const lines: string[] = [];

  // Adiciona imports
  lines.push(generateImports(options));

  // Adiciona decorator @Entity() se TypeORM estiver habilitado
  if (includeTypeOrm) {
    lines.push(`@Entity("${entity.name.toLowerCase()}s")`);
  }

  // Gera a declaração da classe ou interface
  const keyword = useClasses ? "class" : "interface";
  const exportKeyword = exportType === "default" ? "export default" : "export";
  
  lines.push(`${exportKeyword} ${keyword} ${entity.name} {`);

  // Gera as propriedades
  for (const property of entity.properties) {
    lines.push(generateProperty(property, options));
    lines.push(""); // Linha em branco entre propriedades
  }

  lines.push("}");

  return lines.join("\n");
}

/**
 * Gera código para múltiplas entidades
 */
export function generateEntitiesCode(
  entities: EntitySchema[],
  options: EntityGeneratorOptions = {}
): Map<string, string> {
  const result = new Map<string, string>();

  for (const entity of entities) {
    const code = generateEntityCode(entity, options);
    const fileName = `${entity.name.toLowerCase()}.entity.ts`;
    result.set(fileName, code);
  }

  return result;
}

/**
 * Gera um arquivo de índice que exporta todas as entidades
 */
export function generateEntitiesIndex(entities: EntitySchema[]): string {
  const lines: string[] = [];

  for (const entity of entities) {
    const fileName = `${entity.name.toLowerCase()}.entity`;
    lines.push(`export { ${entity.name} } from "./${fileName}";`);
  }

  return lines.join("\n") + "\n";
}
