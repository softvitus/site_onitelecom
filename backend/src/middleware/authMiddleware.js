/**
 * @module middleware/authMiddleware
 * @description Middleware de autenticação - valida tokens JWT e protege rotas
 */

import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ErrorCodes.js';

/**
 * Middleware para validar token JWT
 * Espera token no header: Authorization: Bearer <token>
 * Popula req.user com dados do token
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new ApiError(
        'UNAUTHORIZED',
        'Token de autenticação não fornecido',
        401
      );
    }

    // Esperado formato: "Bearer <token>"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new ApiError(
        'INVALID_TOKEN_FORMAT',
        'Formato de token inválido. Use: Bearer <token>',
        401
      );
    }

    const token = parts[1];

    // Verificar e decodificar token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );

    // Adicionar dados do usuário ao request
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(
        new ApiError(
          'INVALID_TOKEN',
          'Token inválido',
          401
        )
      );
    }

    if (error.name === 'TokenExpiredError') {
      return next(
        new ApiError(
          'TOKEN_EXPIRED',
          'Token expirado',
          401
        )
      );
    }

    next(error);
  }
};

/**
 * Middleware para validar role específica
 * Uso: requireRole(['admin', 'gestor'])
 */
export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(
          'UNAUTHORIZED',
          'Usuário não autenticado',
          401
        );
      }

      if (!allowedRoles.includes(req.user.tipo)) {
        throw new ApiError(
          'FORBIDDEN',
          'Acesso negado. Permissão insuficiente.',
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware para validação de role de admin
 */
export const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(
        'UNAUTHORIZED',
        'Usuário não autenticado',
        401
      );
    }

    if (req.user.tipo !== 'admin') {
      throw new ApiError(
        'FORBIDDEN',
        'Acesso restrito a administradores',
        403
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para validação de role de gestor
 */
export const requireGestor = (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(
        'UNAUTHORIZED',
        'Usuário não autenticado',
        401
      );
    }

    if (!['admin', 'gestor'].includes(req.user.tipo)) {
      throw new ApiError(
        'FORBIDDEN',
        'Acesso restrito a gestores',
        403
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para validar apenas token, sem exigir permissões
 * Usado para rotas públicas que necessitam validação de token
 * Espera token no header: Authorization: Bearer <token>
 */
export const validateTokenOnly = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new ApiError(
        'UNAUTHORIZED',
        'Token de autenticação não fornecido',
        401
      );
    }

    // Esperado formato: "Bearer <token>"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new ApiError(
        'INVALID_TOKEN_FORMAT',
        'Formato de token inválido. Use: Bearer <token>',
        401
      );
    }

    const token = parts[1];

    // Verificar e decodificar token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );

    // Adicionar dados do usuário ao request
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(
        new ApiError(
          'INVALID_TOKEN',
          'Token inválido',
          401
        )
      );
    }

    if (error.name === 'TokenExpiredError') {
      return next(
        new ApiError(
          'TOKEN_EXPIRED',
          'Token expirado',
          401
        )
      );
    }

    next(error);
  }
};

export default authMiddleware;
