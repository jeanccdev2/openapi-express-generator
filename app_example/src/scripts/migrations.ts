import "reflect-metadata";
import { database } from "@/database_typeorm/database.js";
import fs from "fs";

type Command = "create" | "run" | "revert" | "show";

async function main() {
  const command = (process.argv[2] as Command | undefined) ?? "run";

  const dataSource = await database.initialize();

  try {
    if (command === "create") {
      const type = process.argv[3] as "table" | "column";
      if (type !== "table" && type !== "column") {
        throw new Error("Invalid type. Must be 'table' or 'column'.");
      }
      const tableName = process.argv[4] as string | undefined;
      if (!tableName) {
        throw new Error("Table name is required.");
      }
      const migrationNameArgv = process.argv[5] as string | undefined;
      const migrationName =
        migrationNameArgv || type === "table"
          ? "CreateTable"
          : "AddColumn" +
            tableName
              .split("-")
              .map((n) => `${n.charAt(0).toUpperCase()}${n.slice(1)}`)
              .join("") +
            "Migration";

      const template =
        type === "table"
          ? templateCreateTable(tableName, migrationName)
          : templateAddColumn(tableName, migrationName);
      const path = `src/database/migrations/${template.fileName}`;
      fs.writeFileSync(path, template.content);
      return;
    }
    if (command === "run") {
      const migrations = await dataSource.runMigrations();
      console.log(`Applied ${migrations.length} migration(s).`);
      return;
    }

    if (command === "revert") {
      await dataSource.undoLastMigration();
      console.log("Reverted last migration.");
      return;
    }

    if (command === "show") {
      const hasPending = await dataSource.showMigrations();
      console.log(`Pending migrations: ${hasPending ? "yes" : "no"}`);
      return;
    }

    throw new Error(`Unknown command: ${command}`);
  } finally {
    await dataSource.destroy();
  }
}

function templateCreateTable(tableName: string, migrationName: string) {
  const timestamp = new Date().getTime();
  return {
    fileName: `${timestamp}-${migrationName}.ts`,
    content: `import { Table, TableColumn, type MigrationInterface, type QueryRunner } from "typeorm";

export class ${migrationName + timestamp} implements MigrationInterface {
  name = "${migrationName}";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const columnId = new TableColumn({
      name: "id",
      type: "integer",
      isPrimary: true,
    });
    const table = new Table({
      name: "${tableName}",
      columns: [columnId],
    });
    await queryRunner.createTable(table, true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "${tableName}"');
  }
}
`,
  };
}

function templateAddColumn(tableName: string, migrationName: string) {
  return {
    fileName: `${new Date().getTime()}-${migrationName}.ts`,
    content: `import { TableColumn, type MigrationInterface, type QueryRunner } from "typeorm";

export class ${migrationName} implements MigrationInterface {
  name = "${migrationName}";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns("${tableName}", [
      new TableColumn({
        name: "email",
        type: "varchar",
        isNullable: false,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns("${tableName}", ["email"]);
  }
}
`,
  };
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
