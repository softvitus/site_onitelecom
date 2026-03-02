/**
 * @module services/PagComRelService
 * @description Serviço de gerenciamento de relacionamento Página-Componente
 */

import { BaseService } from './BaseService.js';
import { ApiError } from '../utils/ErrorCodes.js';

/**
 * Serviço de gerenciamento de Relacionamento Página-Componente
 * @extends BaseService
 */
export class PagComRelService extends BaseService {
  /**
   * Busca componentes de uma página
   * @param {string} paginaId - ID da página
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de relações
   */
  async findByPaginaId(paginaId, pagination = {}) {
    return this.findAll({ pcr_pag_id: paginaId }, pagination);
  }

  /**
   * Busca páginas que usam um componente
   * @param {string} componenteId - ID do componente
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de relações
   */
  async findByComponenteId(componenteId, pagination = {}) {
    return this.findAll({ pcr_com_id: componenteId }, pagination);
  }

  /**
   * Adiciona componente à página em posição específica
   * @param {string} paginaId - ID da página
   * @param {string} componenteId - ID do componente
   * @param {number} posicao - Posição do componente
   * @returns {Promise<Object>} Relação criada
   * @throws {ApiError} CONFLICT se já existir
   */
  async addComponentToPage(paginaId, componenteId, posicao = 0) {
    const existing = await this.model.findOne({
      where: {
        pcr_pag_id: paginaId,
        pcr_com_id: componenteId,
      },
    });

    if (existing) {
      throw new ApiError('CONFLICT', 'Componente já existe nesta página');
    }

    return this.create({
      pcr_pag_id: paginaId,
      pcr_com_id: componenteId,
      pcr_posicao: posicao,
    });
  }

  /**
   * Remove componente da página
   * @param {string} paginaId - ID da página
   * @param {string} componenteId - ID do componente
   * @returns {Promise<number>} Número de registros removidos
   */
  async removeComponentFromPage(paginaId, componenteId) {
    return this.model.destroy({
      where: {
        pcr_pag_id: paginaId,
        pcr_com_id: componenteId,
      },
    });
  }

  /**
   * Reordena componentes na página
   * @param {string} paginaId - ID da página
   * @param {string[]} order - Array de IDs na ordem desejada
   * @returns {Promise<boolean>} True se sucesso
   */
  async reorderComponents(paginaId, order) {
    for (let i = 0; i < order.length; i++) {
      await this.update(order[i], { pcr_posicao: i });
    }
    return true;
  }
}

export default PagComRelService;
