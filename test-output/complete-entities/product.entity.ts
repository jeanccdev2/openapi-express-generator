import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean, IsEmail, IsDate, IsArray, IsEnum } from "class-validator";


@Entity("products")
export class Product {
  /**
   * ID único do produto
   */
  @PrimaryGeneratedColumn()
  @IsOptional()
  @IsNumber()
  id?: number;

  /**
   * Nome do produto
   */
  @Column()
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * Descrição do produto
   */
  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  /**
   * Preço do produto
   */
  @Column()
  @IsNotEmpty()
  @IsNumber()
  price: number;

  /**
   * Quantidade em estoque
   */
  @Column({ default: 0 })
  @IsOptional()
  @IsNumber()
  stock?: number;

  /**
   * Categoria do produto
   */
  @Column({ type: "enum", enum: ["ELECTRONICS", "CLOTHING", "FOOD", "BOOKS"] })
  @IsOptional()
  @IsEnum(["ELECTRONICS", "CLOTHING", "FOOD", "BOOKS"])
  category?: "ELECTRONICS" | "CLOTHING" | "FOOD" | "BOOKS";

  /**
   * Tags do produto
   */
  @Column()
  @IsOptional()
  @IsArray()
  tags?: string[];

  /**
   * Indica se o produto está disponível
   */
  @Column({ default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

}