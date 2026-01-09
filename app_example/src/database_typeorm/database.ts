import { DataSource } from "typeorm";
import { ExampleEntity } from "@/modules/example/entities_typeorm/example.entity.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const database = new DataSource({
  type: "sqlite",
  database: "database.sqlite",
  synchronize: true,
  logging: false,
  entities: [ExampleEntity],
  migrations: [__dirname + "/migrations/**/*{.js,.ts}"],
  subscribers: [],
});

export async function initDatabase() {
  await database
    .initialize()
    .then(() => {
      console.log("Database connected");
    })
    .catch((err) => {
      console.log("Error connecting to database", err);
    });
}
