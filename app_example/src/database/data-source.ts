import { DataSource } from "typeorm";
import { ExampleEntity } from "@example/entities/example.entity.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "database.sqlite",
  synchronize: true,
  logging: false,
  entities: [ExampleEntity],
  migrations: [__dirname + "/migrations/**/*{.js,.ts}"],
  subscribers: [],
});
