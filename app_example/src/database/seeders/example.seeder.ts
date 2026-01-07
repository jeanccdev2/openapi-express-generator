import { faker } from "@faker-js/faker";
import type { DataSource } from "typeorm";
import { ExampleEntity } from "@example/entities/example.entity.js";
import type { Seeder, SeederContext, SeederRunOptions } from "@/types/seeder.types.js";

export const ExampleSeeder: Seeder = {
  name: "examples",

  async run(dataSource: DataSource, options: SeederRunOptions = {}, _context?: SeederContext) {
    const count = options.count ?? 20;
    const repo = dataSource.getRepository(ExampleEntity);

    const rows = Array.from({ length: count }).map(() =>
      repo.create({
        name: faker.commerce.productName(),
      }),
    );

    await repo.save(rows);
  },

  async clear(dataSource: DataSource) {
    await dataSource.getRepository(ExampleEntity).clear();
  },
};
