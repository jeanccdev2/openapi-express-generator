import fs from "node:fs/promises";
import path from "node:path";
import { readOpenApiFile } from "../openapi/loader.js";
import { extractEntitiesFromOpenApi } from "../openapi/entity-mapper.js";
import {
  generateEntitiesCode,
  generateEntitiesIndex,
} from "../openapi/entity-generator.js";

/**
 * Script para gerar arquivos de entidades a partir do OpenAPI
 */
async function main() {
  try {
    console.log("🚀 Iniciando geração de entidades...\n");

    // 1. Ler o arquivo OpenAPI
    const openApiDoc = await readOpenApiFile("./openapi.yml");
    console.log("✅ Arquivo OpenAPI carregado\n");

    // 2. Extrair entidades
    const entities = extractEntitiesFromOpenApi(openApiDoc);
    
    if (entities.length === 0) {
      console.log("⚠️  Nenhuma entidade encontrada!");
      console.log("💡 Adicione schemas com sufixo 'Entity' no openapi.yml");
      return;
    }

    console.log(`📦 ${entities.length} entidade(s) encontrada(s):`);
    entities.forEach(e => console.log(`   - ${e.originalName}`));
    console.log();

    // 3. Criar diretórios de saída
    const outputDirs = {
      interfaces: "./test-output/interfaces",
      typeorm: "./test-output/typeorm-entities",
      validation: "./test-output/validation-classes",
      complete: "./test-output/complete-entities",
    };

    for (const dir of Object.values(outputDirs)) {
      await fs.mkdir(dir, { recursive: true });
    }

    // 4. Gerar Interfaces TypeScript
    console.log("📝 Gerando interfaces TypeScript...");
    const interfaces = generateEntitiesCode(entities, {
      useClasses: false,
      includeValidation: false,
      includeTypeOrm: false,
    });

    for (const [fileName, code] of interfaces) {
      const filePath = path.join(outputDirs.interfaces, fileName);
      await fs.writeFile(filePath, code);
      console.log(`   ✅ ${fileName}`);
    }

    const interfacesIndex = generateEntitiesIndex(entities);
    await fs.writeFile(
      path.join(outputDirs.interfaces, "index.ts"),
      interfacesIndex
    );
    console.log(`   ✅ index.ts\n`);

    // 5. Gerar Classes com TypeORM
    console.log("🗄️  Gerando classes com TypeORM...");
    const typeormClasses = generateEntitiesCode(entities, {
      useClasses: true,
      includeTypeOrm: true,
      includeValidation: false,
    });

    for (const [fileName, code] of typeormClasses) {
      const filePath = path.join(outputDirs.typeorm, fileName);
      await fs.writeFile(filePath, code);
      console.log(`   ✅ ${fileName}`);
    }

    const typeormIndex = generateEntitiesIndex(entities);
    await fs.writeFile(
      path.join(outputDirs.typeorm, "index.ts"),
      typeormIndex
    );
    console.log(`   ✅ index.ts\n`);

    // 6. Gerar Classes com Validação
    console.log("✔️  Gerando classes com validação...");
    const validationClasses = generateEntitiesCode(entities, {
      useClasses: true,
      includeValidation: true,
      includeTypeOrm: false,
    });

    for (const [fileName, code] of validationClasses) {
      const filePath = path.join(outputDirs.validation, fileName);
      await fs.writeFile(filePath, code);
      console.log(`   ✅ ${fileName}`);
    }

    const validationIndex = generateEntitiesIndex(entities);
    await fs.writeFile(
      path.join(outputDirs.validation, "index.ts"),
      validationIndex
    );
    console.log(`   ✅ index.ts\n`);

    // 7. Gerar Classes Completas (TypeORM + Validação)
    console.log("🎯 Gerando classes completas (TypeORM + Validação)...");
    const completeClasses = generateEntitiesCode(entities, {
      useClasses: true,
      includeValidation: true,
      includeTypeOrm: true,
    });

    for (const [fileName, code] of completeClasses) {
      const filePath = path.join(outputDirs.complete, fileName);
      await fs.writeFile(filePath, code);
      console.log(`   ✅ ${fileName}`);
    }

    const completeIndex = generateEntitiesIndex(entities);
    await fs.writeFile(
      path.join(outputDirs.complete, "index.ts"),
      completeIndex
    );
    console.log(`   ✅ index.ts\n`);

    // 8. Resumo
    console.log("━".repeat(60));
    console.log("✨ Geração concluída com sucesso!\n");
    console.log("📂 Arquivos gerados em:");
    console.log(`   • ${outputDirs.interfaces} (Interfaces)`);
    console.log(`   • ${outputDirs.typeorm} (TypeORM)`);
    console.log(`   • ${outputDirs.validation} (Validação)`);
    console.log(`   • ${outputDirs.complete} (Completo)`);
    console.log("━".repeat(60));

  } catch (error) {
    console.error("\n❌ Erro ao gerar entidades:", error);
    if (error instanceof Error) {
      console.error("Mensagem:", error.message);
      if (error.cause) {
        console.error("Causa:", error.cause);
      }
    }
    process.exit(1);
  }
}

// Executa o script
main();
