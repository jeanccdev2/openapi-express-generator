import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";


@Entity("users")
export class User {
  /**
   * ID único do usuário
   */
  @PrimaryGeneratedColumn()
  id?: number;

  /**
   * Nome completo do usuário
   */
  @Column()
  name: string;

  /**
   * Email do usuário
   */
  @Column()
  email: string;

  /**
   * Idade do usuário
   */
  @Column()
  age?: number;

  /**
   * Indica se o usuário está ativo
   */
  @Column({ default: true })
  isActive?: boolean;

  /**
   * Papel do usuário no sistema
   */
  @Column({ default: "USER", type: "enum", enum: ["ADMIN", "USER", "GUEST"] })
  role?: "ADMIN" | "USER" | "GUEST";

  /**
   * Data de criação do usuário
   */
  @Column()
  createdAt?: Date;

  @Column()
  profile?: object;

}