import { createFullProjectFlow } from "../flows/create.flow.js";
import type { FileTypes } from "../types/file-types.js";
import type { ORM } from "../types/orm.js";
import inquirer from "inquirer";

export type CreateProjectOptions = {
  use: "Projeto Completo" | "Projeto Simples";
  file_types: FileTypes[];
  orm: ORM;
  file_path: string;
};

export async function createProject() {
  const response: CreateProjectOptions =
    await inquirer.prompt<CreateProjectOptions>([
      {
        type: "select",
        name: "use",
        message: "Uso do generator",
        default: "Projeto Completo",
        choices: ["Projeto Completo", "Projeto Simples"],
      },
      {
        type: "checkbox",
        name: "file_types",
        message: "Arquivos a serem gerados",
        choices: [
          "Routes",
          "Controllers",
          "Services",
          "Repositories",
          "Models",
        ],
        when: (answers) => answers.use === "Projeto Simples",
      },
      {
        type: "select",
        name: "orm",
        message: "ORM do Projeto",
        choices: ["TypeORM", "Sequelize", "Prisma"],
        when: (answers) =>
          answers.use === "Projeto Completo" ||
          (answers.use === "Projeto Simples" &&
            answers.file_types &&
            (answers.file_types.includes("Repositories") ||
              answers.file_types.includes("Models"))),
      },
    ]);

  if (response.use === "Projeto Completo") {
    await createFullProjectFlow(response.orm);
  }
}
