/**
 * @module utils/ErrorCodes
 * @description Códigos padronizados de erro da API
 */

export const ERROR_CODES = {
  // Validação (4000-4099)
  VALIDATION_ERROR: { code: 4001, status: 400, message: 'Erro de validação' },
  INVALID_INPUT: { code: 4002, status: 400, message: 'Entrada inválida' },
  MISSING_FIELD: { code: 4003, status: 400, message: 'Campo obrigatório ausente' },
  INVALID_FORMAT: { code: 4004, status: 400, message: 'Formato inválido' },

  // Autenticação (4010-4019)
  UNAUTHORIZED: { code: 4010, status: 401, message: 'Não autorizado' },
  INVALID_CREDENTIALS: { code: 4014, status: 401, message: 'Email ou senha inválidos' },
  INVALID_TOKEN: { code: 4011, status: 401, message: 'Token inválido' },
  EXPIRED_TOKEN: { code: 4012, status: 401, message: 'Token expirado' },
  MISSING_TOKEN: { code: 4013, status: 401, message: 'Token não fornecido' },
  ACCOUNT_BLOCKED: { code: 4015, status: 403, message: 'Conta bloqueada' },
  ACCOUNT_INACTIVE: { code: 4016, status: 403, message: 'Conta inativa' },

  // Autorização (4020-4029)
  FORBIDDEN: { code: 4020, status: 403, message: 'Acesso negado' },
  INSUFFICIENT_PERMISSIONS: { code: 4021, status: 403, message: 'Permissões insuficientes' },

  // Recursos (4030-4039)
  NOT_FOUND: { code: 4030, status: 404, message: 'Recurso não encontrado' },
  RESOURCE_EXISTS: { code: 4031, status: 409, message: 'Recurso já existe' },

  // Conflito (4040-4049)
  CONFLICT: { code: 4040, status: 409, message: 'Conflito' },
  DUPLICATE_ENTRY: { code: 4041, status: 409, message: 'Entrada duplicada' },

  // Rate Limiting (4090-4099)
  RATE_LIMIT_EXCEEDED: { code: 4090, status: 429, message: 'Limite de requisições excedido' },

  // Servidor (5000-5099)
  INTERNAL_ERROR: { code: 5001, status: 500, message: 'Erro interno do servidor' },
  DATABASE_ERROR: { code: 5002, status: 500, message: 'Erro na base de dados' },
  SERVICE_UNAVAILABLE: { code: 5003, status: 503, message: 'Serviço indisponível' },
};

/**
 * Classe para representar erros da API
 */
export class ApiError extends Error {
  constructor(errorCode, message = null, details = null) {
    const error = ERROR_CODES[errorCode] || ERROR_CODES.INTERNAL_ERROR;

    super(message || error.message);

    this.code = error.code;
    this.statusCode = error.status;
    this.details = details;
    this.errorCode = errorCode;

    Object.setPrototypeOf(this, ApiError.prototype);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        errorCode: this.errorCode,
        statusCode: this.statusCode,
        ...(this.details && { details: this.details }),
        timestamp: new Date().toISOString(),
      },
    };
  }
}

/**
 * Funções helper para criar erros
 */
export const createError = (errorCode, message, details) => {
  return new ApiError(errorCode, message, details);
};

/**
 * Middleware para converter ApiError em resposta
 */
export const errorCodeMiddleware = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Erro genérico
  res.status(500).json({
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_ERROR.code,
      message: err.message || ERROR_CODES.INTERNAL_ERROR.message,
      statusCode: 500,
      timestamp: new Date().toISOString(),
    },
  });
};

export default ERROR_CODES;
