/**
 * @module services/PaginaService
 * @description Serviço de gerenciamento de páginas
 */

import { BaseService } from './BaseService.js';
import { ApiError } from '../utils/ErrorCodes.js';
import { Op } from 'sequelize';

/**
 * Serviço de gerenciamento de Páginas
 * @extends BaseService
 */
export class PaginaService extends BaseService {
  /**
   * Busca página com todas relações
   * @param {string} id - ID da página
   * @returns {Promise<Object>} Página com relações
   */
  async findByIdWithRelations(id) {
    return this.findById(id, {
      include: [
        { association: 'tema' },
        { association: 'parceiro' },
        { association: 'componentes' },
        { association: 'conteudos' },
      ],
    });
  }

  /**
   * Busca páginas de um tema
   * @param {string} temaId - ID do tema
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de páginas
   */
  async findByTemaId(temaId, pagination = {}) {
    return this.findAll({ pag_tem_id: temaId }, pagination);
  }

  /**
   * Busca página por caminho (URL)
   * @param {string} path - Caminho da página
   * @returns {Promise<Object>} Página encontrada
   * @throws {ApiError} NOT_FOUND se página não existir
   */
  async findByPath(path) {
    const item = await this.model.findOne({
      where: { pag_caminho: path },
    });

    if (!item) {
      throw new ApiError('NOT_FOUND', 'Página não encontrada');
    }

    return item;
  }

  /**
   * Lista páginas de um parceiro
   * @param {string} parceiroId - ID do parceiro
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de páginas
   */
  async findByParceiroId(parceiroId, pagination = {}) {
    return this.findAll({ pag_par_id: parceiroId }, pagination);
  }

  /**
   * Valida unicidade de caminho
   * @param {string} path - Caminho da página
   * @param {string|null} excludeId - ID a excluir da validação
   * @returns {Promise<boolean>} True se único
   */
  async validateUniquePath(path, excludeId = null) {
    const where = { pag_caminho: path };

    if (excludeId) {
      where.pag_id = { [Op.ne]: excludeId };
    }

    const existing = await this.model.findOne({ where });
    return !existing;
  }
}

export default PaginaService;
