/**
 * @module utils/validators
 * @description Esquemas de validação usando Joi para cada recurso da API
 */

import Joi from 'joi';

// ============================================================================
// CONSTANTES DE VALIDAÇÃO
// ============================================================================

const STATUS_VALUES = ['ativo', 'inativo', 'suspenso'];

// ============================================================================
// PARCEIRO VALIDATORS
// ============================================================================

export const parceiroCreateSchema = Joi.object({
  par_nome: Joi.string().min(2).max(255).required().messages({
    'string.empty': 'Nome é obrigatório',
    'string.min': 'Nome deve ter no mínimo 2 caracteres',
    'string.max': 'Nome deve ter no máximo 255 caracteres',
  }),
  par_dominio: Joi.string().max(255).required().messages({
    'string.empty': 'Domínio é obrigatório',
    'string.max': 'Domínio deve ter no máximo 255 caracteres',
  }),
  par_dominio_painel: Joi.string()
    .max(255)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'Domínio do painel deve ter no máximo 255 caracteres',
    }),
  par_cidade: Joi.string().max(100).required().messages({
    'string.empty': 'Cidade é obrigatória',
  }),
  par_estado: Joi.string().length(2).optional().messages({
    'string.length': 'Estado deve ter 2 caracteres (UF)',
  }),
  par_cep: Joi.string().max(10).optional(),
  par_endereco: Joi.string().max(500).optional(),
  par_latitude: Joi.number().min(-90).max(90).optional(),
  par_longitude: Joi.number().min(-180).max(180).optional(),
  par_raio_cobertura: Joi.number().min(0).optional(),
  par_status: Joi.string()
    .valid(...STATUS_VALUES)
    .default('ativo'),
});

export const parceiroUpdateSchema = Joi.object({
  par_nome: Joi.string().min(2).max(255).optional(),
  par_dominio: Joi.string().max(255).optional(),
  par_dominio_painel: Joi.string().max(255).optional().allow(null, ''),
  par_cidade: Joi.string().max(100).optional(),
  par_estado: Joi.string().length(2).optional(),
  par_cep: Joi.string().max(10).optional(),
  par_endereco: Joi.string().max(500).optional(),
  par_latitude: Joi.number().min(-90).max(90).optional(),
  par_longitude: Joi.number().min(-180).max(180).optional(),
  par_raio_cobertura: Joi.number().min(0).optional(),
  par_status: Joi.string()
    .valid(...STATUS_VALUES)
    .optional(),
});

// ============================================================================
// TEMA VALIDATORS
// ============================================================================

export const temaCreateSchema = Joi.object({
  tem_nome: Joi.string().min(2).max(255).required().messages({
    'string.empty': 'Nome é obrigatório',
    'string.min': 'Nome deve ter no mínimo 2 caracteres',
  }),
  tem_par_id: Joi.string().uuid().required().messages({
    'string.empty': 'Parceiro é obrigatório',
    'string.guid': 'ID do parceiro inválido',
  }),
});

export const temaUpdateSchema = Joi.object({
  tem_nome: Joi.string().min(2).max(255).optional(),
  tem_par_id: Joi.string().uuid().optional(),
});

// ============================================================================
// PÁGINA VALIDATORS
// ============================================================================

export const paginaCreateSchema = Joi.object({
  pag_nome: Joi.string().min(2).max(255).required().messages({
    'string.empty': 'Nome é obrigatório',
  }),
  pag_caminho: Joi.string().max(255).required().messages({
    'string.empty': 'Caminho é obrigatório',
  }),
  pag_titulo: Joi.string().max(255).required().messages({
    'string.empty': 'Título é obrigatório',
  }),
  pag_par_id: Joi.string().uuid().required().messages({
    'string.empty': 'Parceiro é obrigatório',
  }),
  pag_tem_id: Joi.string().uuid().required().messages({
    'string.empty': 'Tema é obrigatório',
  }),
  pag_status: Joi.string()
    .valid(...STATUS_VALUES)
    .default('ativo'),
  pag_mostrar_no_menu: Joi.boolean().default(false),
  pag_etiqueta_menu: Joi.string().max(100).optional().allow(null, ''),
  pag_ordem_menu: Joi.number().integer().min(0).optional().allow(null),
  pag_icone: Joi.string().max(100).optional().allow(null, ''),
  pag_categoria: Joi.string().max(100).optional().allow(null, ''),
});

export const paginaUpdateSchema = Joi.object({
  pag_nome: Joi.string().min(2).max(255).optional(),
  pag_caminho: Joi.string().max(255).optional(),
  pag_titulo: Joi.string().max(255).optional(),
  pag_par_id: Joi.string().uuid().optional(),
  pag_tem_id: Joi.string().uuid().optional(),
  pag_status: Joi.string()
    .valid(...STATUS_VALUES)
    .optional(),
  pag_mostrar_no_menu: Joi.boolean().optional(),
  pag_etiqueta_menu: Joi.string().max(100).optional().allow(null, ''),
  pag_ordem_menu: Joi.number().integer().min(0).optional().allow(null),
  pag_icone: Joi.string().max(100).optional().allow(null, ''),
  pag_categoria: Joi.string().max(100).optional().allow(null, ''),
});

// ============================================================================
// FILTROS (QUERY PARAMS)
// ============================================================================

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string()
    .valid(...STATUS_VALUES)
    .optional(),
  search: Joi.string().max(255).optional(),
});

// ============================================================================
// MIDDLEWARE DE VALIDAÇÃO
// ============================================================================

/**
 * Middleware factory para validar body da requisição
 * @param {Joi.Schema} schema - Schema Joi para validação
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));

      return res.status(400).json({
        success: false,
        error: 'Erro de validação',
        details,
      });
    }

    req.body = value; // Substitui com valores sanitizados
    next();
  };
};

/**
 * Middleware factory para validar query params
 * @param {Joi.Schema} schema - Schema Joi para validação
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));

      return res.status(400).json({
        success: false,
        error: 'Parâmetros de consulta inválidos',
        details,
      });
    }

    req.query = value;
    next();
  };
};
