import Joi from 'joi';

/**
 * Esquemas de validação usando Joi
 * 
 * Cada recurso terá seus próprios schemas:
 * - validateCreateParceiro
 * - validateUpdateParceiro
 * - validateCreateTema
 * - ... etc
 */

export const exampleCreateSchema = Joi.object({
  nome: Joi.string().min(3).max(255).required().messages({
    'string.empty': 'Nome é obrigatório',
    'string.min': 'Nome deve ter no mínimo 3 caracteres',
    'string.max': 'Nome deve ter no máximo 255 caracteres',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email inválido',
    'string.empty': 'Email é obrigatório',
  }),
  descricao: Joi.string().max(1000).optional(),
  status: Joi.string().valid('ativo', 'inativo', 'suspenso').default('ativo'),
});

export const exampleUpdateSchema = Joi.object({
  nome: Joi.string().min(3).max(255).optional(),
  email: Joi.string().email().optional(),
  descricao: Joi.string().max(1000).optional(),
  status: Joi.string().valid('ativo', 'inativo', 'suspenso').optional(),
});

export const exampleFilterSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('ativo', 'inativo', 'suspenso').optional(),
  search: Joi.string().optional(),
});
