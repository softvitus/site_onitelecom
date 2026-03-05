/**
 * @module middleware/rateLimiter
 * @description Middleware de rate limiting - protege contra abuso e DDOS
 */

import rateLimit from 'express-rate-limit';

// Em desenvolvimento/teste, usar limites mais altos
const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

/**
 * Limitador geral - 500 requisições por 15 minutos (produção)
 * Em dev/test: 1000 requisições por 15 minutos
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isDev ? 1000 : 500, // requisições máximas
  message: 'muitas-requisicoes',
  statusCode: 429, // Too Many Requests
  standardHeaders: true, // Retorna info em `RateLimit-*` headers
  skip: (req) => {
    // Não aplica rate limit para health checks
    return req.path.startsWith('/health');
  },
});

/**
 * Limitador para autenticação - 20 tentativas por 15 minutos (produção)
 * Em dev/test: 100 tentativas por 15 minutos
 * Previne força bruta
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: isDev ? 100 : 20, // tentativas
  message: 'muitas-tentativas-login',
  statusCode: 429,
  skipSuccessfulRequests: true, // Não conta requisições bem-sucedidas
  standardHeaders: true,
});

/**
 * Limitador para API endpoints - 5000 requisições por hora (produção)
 * Em dev/test: 10000 requisições por hora
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: isDev ? 10000 : 5000,
  message: 'limite-api-excedido',
  statusCode: 429,
  standardHeaders: true,
});

/**
 * Limitador para uploads - 100 uploads por dia (produção)
 * Em dev/test: 300 uploads por dia
 */
export const uploadLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: isDev ? 300 : 100,
  message: 'limite-uploads-excedido',
  statusCode: 429,
  standardHeaders: true,
});

/**
 * Middleware customizado para retornar erro estruturado
 * Compatível com error handler da aplicação
 */
export const rateLimitErrorHandler = (err, req, res, next) => {
  if (err.status === 429) {
    return res.status(429).json({
      status: 'error',
      code: 'RATE_LIMIT_EXCEEDED',
      message: err.message || 'muitas-requisicoes',
      retryAfter: err.retryAfter || 900, // segundos
    });
  }
  next(err);
};
