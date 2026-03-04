/**
 * @module middleware/errorHandler
 * @description Middleware de tratamento de erros - centraliza gerenciamento de erros da aplicação
 */

export const errorHandler = (err, req, res, _next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Status code: usar do erro ou 500
  const statusCode = err.statusCode || err.status || 500;

  // Estrutura padrão de resposta de erro
  const errorResponse = {
    success: false,
    error: {
      message: err.message || 'Erro interno do servidor',
      statusCode,
      timestamp: new Date().toISOString(),
    },
  };

  // Em desenvolvimento, incluir stack trace
  if (isDevelopment) {
    errorResponse.error.stack = err.stack;
    errorResponse.error.details = err;
  }

  // eslint-disable-next-line no-console
  console.error('[ERROR]', {
    status: statusCode,
    message: err.message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    stack: isDevelopment ? err.stack : undefined,
  });

  res.status(statusCode).json(errorResponse);
};

/**
 * Catch-All Middleware para rotas não encontradas
 */
export const notFoundHandler = (req, res, _next) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Rota não encontrada',
      path: req.originalUrl,
      method: req.method,
      statusCode: 404,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Async Error Wrapper
 * Envolve funções async para capturar erros não capturados
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
