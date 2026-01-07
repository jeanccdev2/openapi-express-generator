export class AppException extends Error {
  public readonly statusCode: number;
  public readonly code?: string;

  private constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }

  static internal(message = "Erro interno do servidor") {
    return new AppException(message, 500);
  }

  static invalidCredentials(message = "Credenciais inválidas") {
    return new AppException(message, 401, "INVALID_CREDENTIALS");
  }

  static uniqueViolation(message = "Recurso já existe") {
    return new AppException(message, 409, "UNIQUE_VIOLATION");
  }

  static externalService(message = "Erro de serviço externo") {
    return new AppException(message, 502, "EXTERNAL_SERVICE_ERROR");
  }

  static notFound(message = "Recurso não encontrado") {
    return new AppException(message, 404, "NOT_FOUND");
  }

  static forbidden(message = "Acesso negado") {
    return new AppException(message, 403, "FORBIDDEN");
  }

  static unauthorized(message = "Não autorizado") {
    return new AppException(message, 401, "UNAUTHORIZED");
  }

  static badRequest(message = "Requisição inválida") {
    return new AppException(message, 400, "BAD_REQUEST");
  }

  static notAcceptable(message = "Requisição não aceitável") {
    return new AppException(message, 406, "NOT_ACCEPTABLE");
  }

  static emailInvalid(message = "Email inválido") {
    return new AppException(message, 400, "EMAIL_INVALID");
  }

  static emailAlreadyInUse(message = "Email já em uso") {
    return new AppException(message, 400, "EMAIL_ALREADY_IN_USE");
  }

  static passwordInvalid(message = "Senha inválida") {
    return new AppException(message, 400, "PASSWORD_INVALID");
  }

  static documentInvalid(message = "Documento inválido") {
    return new AppException(message, 400, "DOCUMENT_INVALID");
  }
}
