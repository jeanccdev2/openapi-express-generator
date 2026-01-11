import { createFullProjectFlow } from "../flows/create.flow.js";
import type { ORM } from "../types/orm.js";
import inquirer from "inquirer";

export type CreateProjectOptions = {
  project_name: string;
  orm: ORM;
};

export async function createProject() {
  const response: CreateProjectOptions =
    await inquirer.prompt<CreateProjectOptions>([
      {
        type: "input",
        name: "project_name",
        message: "Nome do Projeto",
        default: "my-app",
      },
      {
        type: "select",
        name: "orm",
        message: "ORM do Projeto",
        choices: ["TypeORM", "Sequelize", "Prisma"],
      },
    ]);

  await createFullProjectFlow(response);
}
