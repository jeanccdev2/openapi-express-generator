import type { DataSource } from "typeorm";

export type SeederContext = {
  seed?: number;
};

export type SeederRunOptions = {
  count?: number;
};

export interface Seeder {
  name: string;
  run(dataSource: DataSource, options?: SeederRunOptions, context?: SeederContext): Promise<void>;
  clear?(dataSource: DataSource): Promise<void>;
}
