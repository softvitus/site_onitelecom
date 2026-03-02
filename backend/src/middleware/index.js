/**
 * @module middleware/index
 * @description Export centralizado de todos os middlewares
 */

// Error Handling
export { errorHandler, notFoundHandler, asyncHandler } from './errorHandler.js';

// Authentication & Authorization
export { authenticate, authorize, generateToken, verifyToken } from './auth.js';
export { authMiddleware, validateTokenOnly, requireRole, requireAdmin, requireGestor } from './authMiddleware.js';
export { requirePermission, requireAnyPermission, requireAllPermissions, clearPermissionCache } from './permissionMiddleware.js';

// Validation & Logging
export { validate, schemas } from './validation.js';
export { requestLogger, performanceLogger, detailedLogger, databaseLogger, coloredStatusLogger } from './logging.js';

// Audit & Rate Limiting
export { captureAuditData } from './audit.js';
export { generalLimiter, authLimiter, apiLimiter, uploadLimiter, rateLimitErrorHandler } from './rateLimiter.js';
