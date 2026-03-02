/**
 * @module middleware/auth
 * @description Middleware de autenticação - valida JWT tokens e autorização
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

/**
 * Gera um token JWT
 */
export const generateToken = (payload, options = {}) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
    ...options,
  });
};

/**
 * Verifica e decodifica um token JWT
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw {
      statusCode: 401,
      message: `Token inválido ou expirado: ${error.message}`,
    };
  }
};

/**
 * Middleware de autenticação
 * Verifica se o JWT está presente e válido
 */
export const authenticate = (req, res, next) => {
  try {
    // Extrai o token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token não fornecido',
          statusCode: 401,
        },
      });
    }

    // Esperado: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Formato de token inválido. Use: Bearer <token>',
          statusCode: 401,
        },
      });
    }

    const token = parts[1];

    // Verifica o token
    const decoded = verifyToken(token);
    
    // Armazena o usuário decodificado para uso posterior
    req.user = decoded;
    
    console.log('[AUTH] Token verificado para usuário:', decoded.id);
    next();
  } catch (error) {
    res.status(error.statusCode || 401).json({
      success: false,
      error: {
        message: error.message || 'Falha na autenticação',
        statusCode: error.statusCode || 401,
      },
    });
  }
};

/**
 * Middleware de autorização baseado em role
 * @param {string[]} allowedRoles - Array de roles permitidas
 */
export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Autenticação necessária',
          statusCode: 401,
        },
      });
    }

    const userRole = req.user.role;
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      console.warn(`[WARN] Acesso negado para usuário ${req.user.id} com role ${userRole}`);
      return res.status(403).json({
        success: false,
        error: {
          message: 'Permissão insuficiente',
          statusCode: 403,
          required_roles: allowedRoles,
          user_role: userRole,
        },
      });
    }

    next();
  };
};

/**
 * Login endpoint helper
 * Cria token JWT para novo usuário
 */
export const login = (userData) => {
  const token = generateToken({
    id: userData.id,
    email: userData.email,
    role: userData.role || 'user',
    iat: Math.floor(Date.now() / 1000),
  });

  return {
    success: true,
    token,
    user: {
      id: userData.id,
      email: userData.email,
      role: userData.role || 'user',
    },
  };
};

/**
 * Logout endpoint helper
 * (Em produção, seria melhor usar blacklist ou Redis)
 */
export const logout = (req, res) => {
  // Remove token do client
  res.json({
    success: true,
    message: 'Logout realizado com sucesso',
  });
};
