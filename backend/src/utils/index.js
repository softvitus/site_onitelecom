/**
 * @module utils/index
 * @description Export centralizado de utilitários
 */

// Core Utils
export { default as CacheManager, cache } from './CacheManager.js';
export { ResponseFormatter } from './ResponseFormatter.js';
export { PaginationHelper } from './PaginationHelper.js';
export { QueryBuilder } from './QueryBuilder.js';

// Error Handling
export {
  ERROR_CODES,
  ApiError,
  createError,
  errorCodeMiddleware,
} from './ErrorCodes.js';

// Validators
export {
  parceiroCreateSchema,
  parceiroUpdateSchema,
  temaCreateSchema,
  temaUpdateSchema,
  paginaCreateSchema,
  paginaUpdateSchema,
  paginationSchema,
  validateBody,
  validateQuery,
} from './validators.js';

// Constants
export {
  HTTP_STATUS,
  STATUS_ENUM,
  COMPONENT_TYPE,
  LINK_CATEGORY,
  IMAGE_CATEGORY,
  TEXT_CATEGORY,
  COLOR_CATEGORY,
  API_MESSAGES,
} from './constants.js';

// Services (re-export para conveniência)
export { BaseService } from '../services/BaseService.js';
