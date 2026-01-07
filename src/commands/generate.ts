import inquirer from "inquirer";

export async function generateRoutes() {
  const response = await inquirer.prompt([
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
    },
  ]);

  console.log(response);
}
