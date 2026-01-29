/**
 * FlowPay SDK Errors
 */

export class FlowPayError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode?: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'FlowPayError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Mantém o stack trace correto
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FlowPayError);
    }
  }
}

export class AuthenticationError extends FlowPayError {
  constructor(message: string = 'Chave de API inválida ou ausente') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends FlowPayError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends FlowPayError {
  constructor(message: string = 'Recurso não encontrado') {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends FlowPayError {
  constructor(message: string = 'Limite de requisições excedido') {
    super(message, 'RATE_LIMIT', 429);
    this.name = 'RateLimitError';
  }
}

export class ServerError extends FlowPayError {
  constructor(message: string = 'Erro interno do servidor') {
    super(message, 'SERVER_ERROR', 500);
    this.name = 'ServerError';
  }
}
