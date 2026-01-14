import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";


@Entity("products")
export class Product {
  /**
   * ID único do produto
   */
  @PrimaryGeneratedColumn()
  id?: number;

  /**
   * Nome do produto
   */
  @Column()
  name: string;

  /**
   * Descrição do produto
   */
  @Column({ nullable: true })
  description?: string | null;

  /**
   * Preço do produto
   */
  @Column()
  price: number;

  /**
   * Quantidade em estoque
   */
  @Column({ default: 0 })
  stock?: number;

  /**
   * Categoria do produto
   */
  @Column({ type: "enum", enum: ["ELECTRONICS", "CLOTHING", "FOOD", "BOOKS"] })
  category?: "ELECTRONICS" | "CLOTHING" | "FOOD" | "BOOKS";

  /**
   * Tags do produto
   */
  @Column()
  tags?: string[];

  /**
   * Indica se o produto está disponível
   */
  @Column({ default: true })
  isAvailable?: boolean;

}