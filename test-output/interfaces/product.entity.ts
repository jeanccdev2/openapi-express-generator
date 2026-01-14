
export interface Product {
  /**
   * ID único do produto
   */
  id?: number;

  /**
   * Nome do produto
   */
  name: string;

  /**
   * Descrição do produto
   */
  description?: string | null;

  /**
   * Preço do produto
   */
  price: number;

  /**
   * Quantidade em estoque
   */
  stock?: number;

  /**
   * Categoria do produto
   */
  category?: "ELECTRONICS" | "CLOTHING" | "FOOD" | "BOOKS";

  /**
   * Tags do produto
   */
  tags?: string[];

  /**
   * Indica se o produto está disponível
   */
  isAvailable?: boolean;

}