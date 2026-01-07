import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, type DeepPartial } from "typeorm";

@Entity("examples")
export class ExampleEntity extends BaseEntity {
  @PrimaryGeneratedColumn("increment", { type: "integer" })
  id!: number;

  @Column({ type: "varchar" })
  name!: string;
}

export type CreateExampleEntityInterface = DeepPartial<ExampleEntity>;

export type UpdateExampleEntityInterface = Partial<CreateExampleEntityInterface>;
