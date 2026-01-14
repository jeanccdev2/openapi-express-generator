import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, IsEmail, IsDate, IsArray, IsEnum } from "class-validator";


@Entity("users")
export class User {
  /**
   * ID único do usuário
   */
  @PrimaryGeneratedColumn()
  @IsOptional()
  @IsNumber()
  id?: number;

  /**
   * Nome completo do usuário
   */
  @Column()
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * Email do usuário
   */
  @Column()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  /**
   * Idade do usuário
   */
  @Column()
  @IsOptional()
  @IsNumber()
  age?: number;

  /**
   * Indica se o usuário está ativo
   */
  @Column({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  /**
   * Papel do usuário no sistema
   */
  @Column({ default: "USER", type: "enum", enum: ["ADMIN", "USER", "GUEST"] })
  @IsOptional()
  @IsEnum(["ADMIN", "USER", "GUEST"])
  role?: "ADMIN" | "USER" | "GUEST";

  /**
   * Data de criação do usuário
   */
  @Column()
  @IsOptional()
  createdAt?: Date;

  @Column()
  @IsOptional()
  profile?: object;

}