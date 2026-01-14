import { readOpenApiFile } from "../openapi/loader.js";
import {
  extractEntitiesFromOpenApi,
  findEntityByName,
  listEntityNames,
} from "../openapi/entity-mapper.js";
import {
  generateEntityCode,
  generateEntitiesCode,
  generateEntitiesIndex,
} from "../openapi/entity-generator.js";

/**
 * Exemplo de uso das funções de mapeamento e geração de entidades
 */
async function main() {
  try {
    // 1. Ler o arquivo OpenAPI
    console.log("📖 Lendo arquivo OpenAPI...\n");
    const openApiDoc = await readOpenApiFile("./openapi.yml");

    // 2. Listar todos os nomes de entidades
    console.log("📋 Entidades disponíveis:");
    const entityNames = listEntityNames(openApiDoc);
    console.log(entityNames.length > 0 ? entityNames.join(", ") : "Nenhuma entidade encontrada");
    console.log();

    // 3. Extrair todas as entidades
    console.log("🔍 Extraindo entidades do OpenAPI...\n");
    const entities = extractEntitiesFromOpenApi(openApiDoc);

    if (entities.length === 0) {
      console.log("⚠️  Nenhuma entidade encontrada (schemas terminando com 'Entity')");
      console.log("💡 Adicione schemas com sufixo 'Entity' no openapi.yml");
      console.log("\nExemplo:");
      console.log("components:");
      console.log("  schemas:");
      console.log("    UserEntity:");
      console.log("      type: object");
      console.log("      properties:");
      console.log("        id:");
      console.log("          type: integer");
      console.log("        name:");
      console.log("          type: string");
      return;
    }

    console.log(`✅ ${entities.length} entidade(s) encontrada(s):\n`);

    // 4. Exibir informações sobre cada entidade
    for (const entity of entities) {
      console.log(`📦 Entidade: ${entity.originalName} (${entity.name})`);
      console.log(`   Propriedades: ${entity.properties.length}`);
      
      for (const prop of entity.properties) {
        const required = prop.required ? "obrigatório" : "opcional";
        const nullable = prop.nullable ? ", nullable" : "";
        console.log(`   - ${prop.name}: ${prop.type} (${required}${nullable})`);
        
        if (prop.description) {
          console.log(`     → ${prop.description}`);
        }
        
        if (prop.nestedProperties && prop.nestedProperties.length > 0) {
          console.log(`     → Propriedades aninhadas: ${prop.nestedProperties.length}`);
          for (const nested of prop.nestedProperties) {
            console.log(`       • ${nested.name}: ${nested.type}`);
          }
        }
      }
      console.log();
    }

    // 5. Gerar código para as entidades (Interface TypeScript)
    console.log("🔨 Gerando código das entidades (Interfaces)...\n");
    const interfaceCode = generateEntitiesCode(entities, {
      useClasses: false,
      includeValidation: false,
      includeTypeOrm: false,
    });

    for (const [fileName, code] of interfaceCode) {
      console.log(`📄 ${fileName}:`);
      console.log("─".repeat(60));
      console.log(code);
      console.log("─".repeat(60));
      console.log();
    }

    // 6. Gerar código para as entidades (Classes com TypeORM)
    console.log("🔨 Gerando código das entidades (Classes com TypeORM)...\n");
    const classCode = generateEntitiesCode(entities, {
      useClasses: true,
      includeValidation: false,
      includeTypeOrm: true,
    });

    for (const [fileName, code] of classCode) {
      console.log(`📄 ${fileName}:`);
      console.log("─".repeat(60));
      console.log(code);
      console.log("─".repeat(60));
      console.log();
    }

    // 7. Gerar código para as entidades (Classes com validação)
    console.log("🔨 Gerando código das entidades (Classes com validação)...\n");
    const validationCode = generateEntitiesCode(entities, {
      useClasses: true,
      includeValidation: true,
      includeTypeOrm: false,
    });

    for (const [fileName, code] of validationCode) {
      console.log(`📄 ${fileName}:`);
      console.log("─".repeat(60));
      console.log(code);
      console.log("─".repeat(60));
      console.log();
    }

    // 8. Gerar arquivo de índice
    console.log("📑 Gerando arquivo de índice (index.ts)...\n");
    const indexCode = generateEntitiesIndex(entities);
    console.log("─".repeat(60));
    console.log(indexCode);
    console.log("─".repeat(60));
    console.log();

    // 9. Exemplo de busca de entidade específica
    if (entities.length > 0) {
      const firstEntityName = entities[0]?.name;
      if (firstEntityName) {
        console.log(`🔎 Buscando entidade específica: ${firstEntityName}...\n`);
        const foundEntity = findEntityByName(openApiDoc, firstEntityName);
      
        if (foundEntity) {
          console.log(`✅ Entidade encontrada: ${foundEntity.originalName}`);
          console.log(`   Nome: ${foundEntity.name}`);
          console.log(`   Propriedades: ${foundEntity.properties.length}`);
        }
      }
    }

    console.log("\n✨ Exemplo executado com sucesso!");

  } catch (error) {
    console.error("❌ Erro ao processar OpenAPI:", error);
    if (error instanceof Error) {
      console.error("Mensagem:", error.message);
      if (error.cause) {
        console.error("Causa:", error.cause);
      }
    }
    process.exit(1);
  }
}

// Executa o exemplo
main();
