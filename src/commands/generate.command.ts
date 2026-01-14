import inquirer from "inquirer";
import type { ORM } from "../types/orm.js";
import type { FileTypes } from "../types/file-types.js";
import { generateFlow } from "../flows/generate.flow.js";

export type GenerateProjectOptions = {
  project_name: string;
  file_types: FileTypes[];
  orm: ORM;
  file_path: string;
};

export async function generateRoutes() {
  const response = await inquirer.prompt([
    {
      type: "input",
      name: "project_name",
      message: "Nome do Projeto",
      default: "my-app",
    },
    {
      type: "checkbox",
      name: "file_types",
      message: "Arquivos a serem gerados",
      choices: ["Routes", "Controllers", "Services", "Repositories", "Models"],
    },
    {
      type: "select",
      name: "orm",
      message: "ORM do Projeto",
      choices: ["TypeORM", "Sequelize", "Prisma"],
      when: (answers) =>
        answers.file_types &&
        (answers.file_types.includes("Repositories") ||
          answers.file_types.includes("Models")),
    },
    {
      type: "input",
      name: "file_path",
      message: "Caminho do arquivo",
      default: "openapi.yml",
    },
  ]);

  await generateFlow(response);

  console.log("\n✅ Geração finalizada com sucesso!\n");
  console.log(`\nProjeto gerado na pasta generated/${response.project_name}\n`);
}
