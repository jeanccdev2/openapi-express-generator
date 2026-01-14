import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, IsEmail, IsDate, IsArray, IsEnum } from "class-validator";


export class Product {
  /**
   * ID único do produto
   */
  @IsOptional()
  @IsNumber()
  id?: number;

  /**
   * Nome do produto
   */
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * Descrição do produto
   */
  @IsOptional()
  @IsString()
  description?: string | null;

  /**
   * Preço do produto
   */
  @IsNotEmpty()
  @IsNumber()
  price: number;

  /**
   * Quantidade em estoque
   */
  @IsOptional()
  @IsNumber()
  stock?: number;

  /**
   * Categoria do produto
   */
  @IsOptional()
  @IsEnum(["ELECTRONICS", "CLOTHING", "FOOD", "BOOKS"])
  category?: "ELECTRONICS" | "CLOTHING" | "FOOD" | "BOOKS";

  /**
   * Tags do produto
   */
  @IsOptional()
  @IsArray()
  tags?: string[];

  /**
   * Indica se o produto está disponível
   */
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

}