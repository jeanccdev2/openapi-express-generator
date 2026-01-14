import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, IsEmail, IsDate, IsArray, IsEnum } from "class-validator";


export class User {
  /**
   * ID único do usuário
   */
  @IsOptional()
  @IsNumber()
  id?: number;

  /**
   * Nome completo do usuário
   */
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * Email do usuário
   */
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  /**
   * Idade do usuário
   */
  @IsOptional()
  @IsNumber()
  age?: number;

  /**
   * Indica se o usuário está ativo
   */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  /**
   * Papel do usuário no sistema
   */
  @IsOptional()
  @IsEnum(["ADMIN", "USER", "GUEST"])
  role?: "ADMIN" | "USER" | "GUEST";

  /**
   * Data de criação do usuário
   */
  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  profile?: object;

}