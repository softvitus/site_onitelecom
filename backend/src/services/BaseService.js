/**
 * @module services/BaseService
 * @description Serviço base com operações CRUD comuns
 * @updated 2026-03-02
 */

import { Op } from 'sequelize';
import { ApiError } from '../utils/ErrorCodes.js';
import { QueryBuilder } from '../utils/QueryBuilder.js';

/**
 * Serviço base abstrato para operações CRUD
 * @abstract
 */
export class BaseService {
  /**
   * Cria instância do serviço
   * @param {Object} model - Model Sequelize
   */
  constructor(model) {
    this.model = model;
  }

  /**
   * Cria novo registro
   * @param {Object} data - Dados do registro
   * @returns {Promise<Object>} Registro criado
   * @throws {ApiError} DATABASE_ERROR se falhar
   */
  async create(data) {
    try {
      // eslint-disable-next-line no-console
      console.log(`[BaseService.create] Criando ${this.model.name} com data:`, data);
      const item = await this.model.create(data);
      // eslint-disable-next-line no-console
      console.log(`[SERVICE] ${this.model.name} criado:`, item.id);
      return item;
    } catch (error) {
      console.error(`[BaseService.create] ERRO ao criar ${this.model.name}:`, error.message);
      console.error('[BaseService.create] Stack:', error.stack);
      throw new ApiError('DATABASE_ERROR', `Erro ao criar ${this.model.name}`, error.message);
    }
  }

  /**
   * Busca por ID
   * @param {string} id - ID do registro
   * @param {Object} options - Opções de busca (include, etc)
   * @returns {Promise<Object>} Registro encontrado
   * @throws {ApiError} NOT_FOUND se não existir
   */
  async findById(id, options = {}) {
    try {
      const item = await this.model.findByPk(id, options);

      if (!item) {
        throw new ApiError('NOT_FOUND', `${this.model.name} não encontrado`);
      }

      return item;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('DATABASE_ERROR', `Erro ao buscar ${this.model.name}`, error.message);
    }
  }

  /**
   * Busca todos com filtros e paginação
   * @param {Object} filters - Filtros de busca
   * @param {Object} pagination - Opções de paginação
   * @param {number} pagination.page - Número da página
   * @param {number} pagination.limit - Itens por página
   * @param {string} pagination.sort - Campo de ordenação
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Object>} Lista paginada de registros
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
   * Retorna QueryBuilder para buscas complexas
   * @returns {QueryBuilder} Instância do QueryBuilder
   */
  query() {
    return new QueryBuilder(this.model);
  }

  /**
   * Busca com pesquisa de texto
   * @param {string} term - Termo de busca
   * @param {string[]} fields - Campos para buscar
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de resultados
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
   * @param {string} id - ID do registro
   * @param {Object} data - Dados a atualizar
   * @returns {Promise<Object>} Registro atualizado
   * @throws {ApiError} NOT_FOUND se não existir
   */
  async update(id, data) {
    try {
      const item = await this.findById(id);
      await item.update(data);

      // eslint-disable-next-line no-console
      console.log(`[SERVICE] ${this.model.name} atualizado:`, id);
      return item;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('DATABASE_ERROR', `Erro ao atualizar ${this.model.name}`, error.message);
    }
  }

  /**
   * Deleta registro
   * @param {string} id - ID do registro
   * @returns {Promise<Object>} Registro deletado
   * @throws {ApiError} NOT_FOUND se não existir
   */
  async delete(id) {
    try {
      const item = await this.findById(id);
      await item.destroy();

      // eslint-disable-next-line no-console
      console.log(`[SERVICE] ${this.model.name} deletado:`, id);
      return item;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('DATABASE_ERROR', `Erro ao deletar ${this.model.name}`, error.message);
    }
  }

  /**
   * Deleta múltiplos registros
   * @param {string[]} ids - Array de IDs
   * @returns {Promise<number>} Quantidade deletada
   */
  async deleteMany(ids) {
    try {
      const result = await this.model.destroy({
        where: { id: ids },
      });

      // eslint-disable-next-line no-console
      console.log(`[SERVICE] ${result} ${this.model.name}(s) deletado(s)`);
      return result;
    } catch (error) {
      throw new ApiError('DATABASE_ERROR', `Erro ao deletar ${this.model.name}`, error.message);
    }
  }

  /**
   * Busca ou cria registro
   * @param {Object} data - Dados do registro
   * @param {Object} options - Opções (where para busca)
   * @returns {Promise<{item: Object, created: boolean}>} Registro e flag de criação
   */
  async findOrCreate(data, options = {}) {
    try {
      const [item, created] = await this.model.findOrCreate({
        where: options.where || data,
        defaults: data,
      });

      // eslint-disable-next-line no-console
      console.log(`[SERVICE] ${this.model.name} ${created ? 'criado' : 'encontrado'}:`, item.id);
      return { item, created };
    } catch (error) {
      throw new ApiError('DATABASE_ERROR', `Erro ao buscar/criar ${this.model.name}`, error.message);
    }
  }

  /**
   * Valida campos obrigatórios
   * @param {Object} data - Dados a validar
   * @param {string[]} requiredFields - Campos obrigatórios
   * @throws {ApiError} VALIDATION_ERROR se falhar
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
   * @param {string} sortStr - String de ordenação
   * @returns {Array<Array<string>>} Array de ordenação Sequelize
   */
  parseSort(sortStr) {
    if (!sortStr) {
      return [['createdAt', 'DESC']];
    }

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
   * Retorna estatísticas do modelo
   * @returns {Promise<{total: number, today: number}>} Estatísticas
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
      throw new ApiError('DATABASE_ERROR', 'Erro ao obter estatísticas', error.message);
    }
  }
}

export default BaseService;
