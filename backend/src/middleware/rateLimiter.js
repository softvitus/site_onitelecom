/**
 * Rate Limiting Configuration
 * Protege contra abuso e DDOS
 */

import rateLimit from 'express-rate-limit';

/**
 * Limitador geral - 100 requisições por 15 minutos
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // requisições máximas
  message: 'muitas-requisicoes',
  statusCode: 429, // Too Many Requests
  standardHeaders: true, // Retorna info em `RateLimit-*` headers
  skip: (req) => {
    // Não aplica rate limit para health checks
    return req.path.startsWith('/health');
  },
});

/**
 * Limitador para autenticação - 5 tentativas por 15 minutos
 * Previne força bruta
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: 'muitas-tentativas-login',
  statusCode: 429,
  skipSuccessfulRequests: true, // Não conta requisições bem-sucedidas
  standardHeaders: true,
});

/**
 * Limitador para API endpoints - 1000 requisições por hora
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 1000,
  message: 'limite-api-excedido',
  statusCode: 429,
  standardHeaders: true,
});

/**
 * Limitador para uploads - 30 uploads por dia
 */
export const uploadLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: 30,
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
