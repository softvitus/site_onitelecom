/**
 * Middleware Index
 * Export centralizado de todos os middlewares
 */

export { errorHandler, notFoundHandler, asyncHandler } from './errorHandler.js';
export { authenticate, authorize, generateToken, verifyToken, login, logout } from './auth.js';
export { authMiddleware, validateTokenOnly, requireRole, requireAdmin, requireGestor } from './authMiddleware.js';
export { validate, schemas } from './validation.js';
export { requestLogger, performanceLogger, detailedLogger, databaseLogger, coloredStatusLogger } from './logging.js';
export { requirePermission, requireAnyPermission, requireAllPermissions, clearPermissionCache } from './permissionMiddleware.js';
