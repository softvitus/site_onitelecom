/**
 * Base Service
 * Serviço base com operações CRUD comuns
 */

import { Op } from 'sequelize';
import { ApiError, ERROR_CODES } from '../utils/ErrorCodes.js';
import { QueryBuilder } from '../utils/QueryBuilder.js';

export class BaseService {
  constructor(model) {
    this.model = model;
  }

  /**
   * Cria novo registro
   */
  async create(data) {
    try {
      const item = await this.model.create(data);
      console.log(`[SERVICE] ${this.model.name} criado:`, item.id);
      return item;
    } catch (error) {
      throw new ApiError('DATABASE_ERROR', `Erro ao criar ${this.model.name}`, error.message);
    }
  }

  /**
   * Busca por ID
   */
  async findById(id, options = {}) {
    try {
      const item = await this.model.findByPk(id, options);

      if (!item) {
        throw new ApiError('NOT_FOUND', `${this.model.name} não encontrado`);
      }

      return item;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('DATABASE_ERROR', `Erro ao buscar ${this.model.name}`, error.message);
    }
  }

  /**
   * Busca todos com filtros e paginação
   */
  async findAll(filters = {}, pagination = {}, options = {}) {
    try {
      const { page = 1, limit = 10, sort = '-createdAt' } = pagination;
      const offset = (page - 1) * limit;

      // Parse sort
      const orderArray = this.parseSort(sort);

      const result = await this.model.findAndCountAll({
        where: filters,
        limit,
        offset,
        order: orderArray,
        ...options,
      });

      return {
        rows: result.rows,
        pagination: {
          total: result.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(result.count / limit),
        },
      };
    } catch (error) {
      throw new ApiError('DATABASE_ERROR', `Erro ao listar ${this.model.name}`, error.message);
    }
  }

  /**
   * Busca como builder
   */
  query() {
    return new QueryBuilder(this.model);
  }

  /**
   * Busca com pesquisa de texto
   */
  async search(term, fields, pagination = {}) {
    try {
      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;

      const conditions = fields.map((field) => ({
        [field]: { [Op.like]: `%${term}%` },
      }));

      const result = await this.model.findAndCountAll({
        where: { [Op.or]: conditions },
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      return {
        rows: result.rows,
        pagination: {
          total: result.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(result.count / limit),
        },
      };
    } catch (error) {
      throw new ApiError('DATABASE_ERROR', `Erro ao pesquisar ${this.model.name}`, error.message);
    }
  }

  /**
   * Atualiza registro
   */
  async update(id, data) {
    try {
      const item = await this.findById(id);
      await item.update(data);

      console.log(`[SERVICE] ${this.model.name} atualizado:`, id);
      return item;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('DATABASE_ERROR', `Erro ao atualizar ${this.model.name}`, error.message);
    }
  }

  /**
   * Deleta registro
   */
  async delete(id) {
    try {
      const item = await this.findById(id);
      await item.destroy();

      console.log(`[SERVICE] ${this.model.name} deletado:`, id);
      return item;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('DATABASE_ERROR', `Erro ao deletar ${this.model.name}`, error.message);
    }
  }

  /**
   * Deleta múltiplos registros
   */
  async deleteMany(ids) {
    try {
      const result = await this.model.destroy({
        where: { id: ids },
      });

      console.log(`[SERVICE] ${result} ${this.model.name}(s) deletado(s)`);
      return result;
    } catch (error) {
      throw new ApiError('DATABASE_ERROR', `Erro ao deletar ${this.model.name}`, error.message);
    }
  }

  /**
   * Busca ou cria
   */
  async findOrCreate(data, options = {}) {
    try {
      const [item, created] = await this.model.findOrCreate({
        where: options.where || data,
        defaults: data,
      });

      console.log(`[SERVICE] ${this.model.name} ${created ? 'criado' : 'encontrado'}:`, item.id);
      return { item, created };
    } catch (error) {
      throw new ApiError('DATABASE_ERROR', `Erro ao buscar/criar ${this.model.name}`, error.message);
    }
  }

  /**
   * Valida campos obrigatórios
   */
  validate(data, requiredFields) {
    const errors = [];

    for (const field of requiredFields) {
      if (!data[field]) {
        errors.push({
          field,
          message: `${field} é obrigatório`,
        });
      }
    }

    if (errors.length > 0) {
      throw new ApiError('VALIDATION_ERROR', 'Validação falhou', errors);
    }
  }

  /**
   * Parse do parâmetro sort
   */
  parseSort(sortStr) {
    if (!sortStr) return [['createdAt', 'DESC']];

    const sorts = sortStr.split(',').map((s) => {
      s = s.trim();
      if (s.startsWith('-')) {
        return [s.substring(1), 'DESC'];
      }
      return [s, 'ASC'];
    });

    return sorts;
  }

  /**
   * Retorna estatísticas
   */
  async stats() {
    try {
      const total = await this.model.count();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayCount = await this.model.count({
        where: {
          createdAt: {
            [Op.gte]: today,
          },
        },
      });

      return {
        total,
        today: todayCount,
      };
    } catch (error) {
      throw new ApiError('DATABASE_ERROR', `Erro ao obter estatísticas`, error.message);
    }
  }
}

export default BaseService;
