import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, type DeepPartial } from "typeorm";

@Entity("examples")
export class ExampleEntity extends BaseEntity {
  @PrimaryGeneratedColumn("increment", { type: "integer" })
  id!: number;

  @Column({ type: "varchar" })
  name!: string;
}

export type CreateExampleEntity = DeepPartial<ExampleEntity>;

export type UpdateExampleEntity = Partial<CreateExampleEntity>;
