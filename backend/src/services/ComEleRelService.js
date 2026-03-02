/**
 * @module services/ComEleRelService
 * @description Serviço de gerenciamento de relacionamento Componente-Elemento
 */

import { BaseService } from './BaseService.js';
import { ApiError } from '../utils/ErrorCodes.js';

/**
 * Serviço de gerenciamento de Relacionamento Componente-Elemento
 * @extends BaseService
 */
export class ComEleRelService extends BaseService {
  /**
   * Busca elementos de um componente
   * @param {string} componenteId - ID do componente
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de relações
   */
  async findByComponenteId(componenteId, pagination = {}) {
    return this.findAll({ cer_com_id: componenteId }, pagination);
  }

  /**
   * Busca componentes que usam um elemento
   * @param {string} elementoId - ID do elemento
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de relações
   */
  async findByElementoId(elementoId, pagination = {}) {
    return this.findAll({ cer_ele_id: elementoId }, pagination);
  }

  /**
   * Adiciona elemento ao componente
   * @param {string} componenteId - ID do componente
   * @param {string} elementoId - ID do elemento
   * @param {number} posicao - Posição do elemento
   * @returns {Promise<Object>} Relação criada
   * @throws {ApiError} CONFLICT se já existir
   */
  async addElementToComponent(componenteId, elementoId, posicao = 0) {
    const existing = await this.model.findOne({
      where: {
        cer_com_id: componenteId,
        cer_ele_id: elementoId,
      },
    });

    if (existing) {
      throw new ApiError('CONFLICT', 'Elemento já existe neste componente');
    }

    return this.create({
      cer_com_id: componenteId,
      cer_ele_id: elementoId,
      cer_posicao: posicao,
    });
  }

  /**
   * Remove elemento do componente
   * @param {string} componenteId - ID do componente
   * @param {string} elementoId - ID do elemento
   * @returns {Promise<number>} Número de registros removidos
   */
  async removeElementFromComponent(componenteId, elementoId) {
    return this.model.destroy({
      where: {
        cer_com_id: componenteId,
        cer_ele_id: elementoId,
      },
    });
  }

  /**
   * Reordena elementos no componente
   * @param {string} componenteId - ID do componente
   * @param {string[]} order - Array de IDs na ordem desejada
   * @returns {Promise<boolean>} True se sucesso
   */
  async reorderElements(componenteId, order) {
    for (let i = 0; i < order.length; i++) {
      await this.update(order[i], { cer_posicao: i });
    }
    return true;
  }
}

export default ComEleRelService;
