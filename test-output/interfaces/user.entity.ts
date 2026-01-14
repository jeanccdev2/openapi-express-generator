
export interface User {
  /**
   * ID único do usuário
   */
  id?: number;

  /**
   * Nome completo do usuário
   */
  name: string;

  /**
   * Email do usuário
   */
  email: string;

  /**
   * Idade do usuário
   */
  age?: number;

  /**
   * Indica se o usuário está ativo
   */
  isActive?: boolean;

  /**
   * Papel do usuário no sistema
   */
  role?: "ADMIN" | "USER" | "GUEST";

  /**
   * Data de criação do usuário
   */
  createdAt?: Date;

  profile?: object;

}