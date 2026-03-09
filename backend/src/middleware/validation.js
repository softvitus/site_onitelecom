/**
 * @module middleware/validation
 * @description Middleware de validação - valida requisições contra schemas
 */

/**
 * Valida request body contra um schema
 * @param {object} schema - Objeto com validações
 */
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const errors = [];

      // Validar cada campo do schema
      for (const [field, rules] of Object.entries(schema)) {
        const value = req.body[field];

        // Verificar se é obrigatório
        if (
          rules.required &&
          (value === undefined || value === null || value === '')
        ) {
          errors.push({
            field,
            message: `Campo obrigatório: ${field}`,
            code: 'REQUIRED',
          });
          continue;
        }

        // Se não é obrigatório e está vazio, pular validações
        if (!value) {
          continue;
        }

        // Verificar tipo
        if (rules.type) {
          const expectedType = rules.type;
          const actualType = Array.isArray(value) ? 'array' : typeof value;

          if (expectedType === 'string' && actualType !== 'string') {
            errors.push({
              field,
              message: `${field} deve ser uma string`,
              code: 'INVALID_TYPE',
            });
          } else if (expectedType === 'number' && actualType !== 'number') {
            errors.push({
              field,
              message: `${field} deve ser um número`,
              code: 'INVALID_TYPE',
            });
          } else if (expectedType === 'boolean' && actualType !== 'boolean') {
            errors.push({
              field,
              message: `${field} deve ser um booleano`,
              code: 'INVALID_TYPE',
            });
          } else if (expectedType === 'array' && !Array.isArray(value)) {
            errors.push({
              field,
              message: `${field} deve ser um array`,
              code: 'INVALID_TYPE',
            });
          }
        }

        // Verificar min length
        if (
          rules.minLength &&
          typeof value === 'string' &&
          value.length < rules.minLength
        ) {
          errors.push({
            field,
            message: `${field} deve ter no mínimo ${rules.minLength} caracteres`,
            code: 'MIN_LENGTH',
          });
        }

        // Verificar max length
        if (
          rules.maxLength &&
          typeof value === 'string' &&
          value.length > rules.maxLength
        ) {
          errors.push({
            field,
            message: `${field} deve ter no máximo ${rules.maxLength} caracteres`,
            code: 'MAX_LENGTH',
          });
        }

        // Verificar min value
        if (
          rules.min !== undefined &&
          typeof value === 'number' &&
          value < rules.min
        ) {
          errors.push({
            field,
            message: `${field} deve ser maior ou igual a ${rules.min}`,
            code: 'MIN_VALUE',
          });
        }

        // Verificar max value
        if (
          rules.max !== undefined &&
          typeof value === 'number' &&
          value > rules.max
        ) {
          errors.push({
            field,
            message: `${field} deve ser menor ou igual a ${rules.max}`,
            code: 'MAX_VALUE',
          });
        }

        // Verificar padrão (regex)
        if (
          rules.pattern &&
          typeof value === 'string' &&
          !rules.pattern.test(value)
        ) {
          errors.push({
            field,
            message: rules.patternMessage || `${field} tem formato inválido`,
            code: 'PATTERN',
          });
        }

        // Validação customizada
        if (rules.custom) {
          const customError = rules.custom(value);
          if (customError) {
            errors.push({
              field,
              message: customError,
              code: 'CUSTOM',
            });
          }
        }
      }

      // Se houver erros, retornar
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validação falhou',
            statusCode: 400,
            details: errors,
          },
        });
      }

      // Armazenar dados validados
      req.validatedData = req.body;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: 'Erro na validação',
          statusCode: 500,
        },
      });
    }
  };
};

/**
 * Schemas pré-definidos para validações comuns
 */
export const schemas = {
  // Parceiro
  createParceiro: {
    par_nome: { type: 'string', required: true, minLength: 1, maxLength: 255 },
    par_dominio: {
      type: 'string',
      required: true,
      minLength: 3,
      maxLength: 255,
      patternMessage: 'par_dominio deve ser um domínio válido',
    },
    par_dominio_painel: {
      type: 'string',
      required: false,
      pattern: /^https?:\/\/.+/,
      patternMessage:
        'par_dominio_painel deve ser uma URL válida (ex: https://admin.parceiro.com.br)',
      allowNull: true,
      allowEmpty: true,
    },
    par_cidade: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 255,
    },
    par_endereco: { type: 'string', required: false, maxLength: 500 },
    par_cep: { type: 'string', required: false, maxLength: 10 },
    par_latitude: { type: 'number', required: false },
    par_longitude: { type: 'number', required: false },
    par_raio_cobertura: { type: 'number', required: false },
    par_status: { type: 'string', required: false },
  },

  // Tema
  createTema: {
    tem_par_id: { type: 'string', required: true },
    tem_nome: { type: 'string', required: true, minLength: 1, maxLength: 255 },
  },

  // Página
  createPagina: {
    pag_par_id: { type: 'string', required: true },
    pag_tem_id: { type: 'string', required: true },
    pag_nome: { type: 'string', required: true, minLength: 1, maxLength: 255 },
    pag_caminho: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 255,
    },
    pag_titulo: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 255,
    },
  },

  // Componente
  createComponente: {
    com_nome: { type: 'string', required: true, minLength: 1, maxLength: 255 },
  },

  // Email validation
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMessage: 'Email deve ser válido',
  },

  // UUID validation
  uuid: {
    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    patternMessage: 'UUID deve ser válido',
  },
};
