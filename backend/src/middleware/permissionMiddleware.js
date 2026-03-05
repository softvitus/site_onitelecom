/**
 * @module middleware/permissionMiddleware
 * @description Middleware de permissões - valida permissões de usuários com base em roles
 */

import { ApiError } from '../utils/ErrorCodes.js';
import { getModels } from '../models/loader.js';
import NodeCache from 'node-cache';

// Cache de permissões (5 minutos de TTL)
const permCache = new NodeCache({ stdTTL: 300 });

/**
 * Obter permissões de um role (com cache)
 */
async function getPermissoesByRole(tipo) {
  const cacheKey = `role_${tipo}`;
  
  let perms = permCache.get(cacheKey);
  
  if (!perms) {
    const models = getModels();
    const rolePerms = await models.RolePermissao.findByTipo(tipo);
    
    perms = rolePerms.map(rp => rp.permissao.perm_nome);
    permCache.set(cacheKey, perms);
  }
  
  return perms;
}

/**
 * Middleware para verificar permissão específica
 * Uso: requirePermission('criar_tema')
 */
export const requirePermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(
          'UNAUTHORIZED',
          'Usuário não autenticado',
          401,
        );
      }

      const userType = req.user.tipo;

      // Admin tem sempre acesso
      if (userType === 'admin') {
        return next();
      }

      // Verificar permissão do role
      const perms = await getPermissoesByRole(userType);

      if (!perms.includes(permissionName)) {
        throw new ApiError(
          'FORBIDDEN',
          `Permissão negada: ${permissionName}`,
          403,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware para verificar múltiplas permissões (OR)
 * Uso: requireAnyPermission(['criar_tema', 'editar_tema'])
 */
export const requireAnyPermission = (permissionNames) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(
          'UNAUTHORIZED',
          'Usuário não autenticado',
          401,
        );
      }

      const userType = req.user.tipo;

      // Admin tem sempre acesso
      if (userType === 'admin') {
        return next();
      }

      // Verificar se tem alguma das permissões
      const perms = await getPermissoesByRole(userType);
      const hasPermission = permissionNames.some(perm => perms.includes(perm));

      if (!hasPermission) {
        throw new ApiError(
          'FORBIDDEN',
          `Permissão negada. Requeridas: ${permissionNames.join(', ')}`,
          403,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware para verificar múltiplas permissões (AND)
 * Uso: requireAllPermissions(['criar_tema', 'editar_tema'])
 */
export const requireAllPermissions = (permissionNames) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(
          'UNAUTHORIZED',
          'Usuário não autenticado',
          401,
        );
      }

      const userType = req.user.tipo;

      // Admin tem sempre acesso
      if (userType === 'admin') {
        return next();
      }

      // Verificar se tem todas as permissões
      const perms = await getPermissoesByRole(userType);
      const hasAllPermissions = permissionNames.every(perm => perms.includes(perm));

      if (!hasAllPermissions) {
        throw new ApiError(
          'FORBIDDEN',
          `Permissão negada. Requeridas: ${permissionNames.join(', ')}`,
          403,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Limpar cache de permissões (útil após atualizar permissões)
 */
export const clearPermissionCache = () => {
  permCache.flushAll();
};

export default {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  clearPermissionCache,
};
