/**
 * ComEleRel Service
 * Lógica para relacionamento Componente-Elemento
 */

import { BaseService } from './BaseService.js';
import { ApiError, ERROR_CODES } from '../utils/ErrorCodes.js';

export class ComEleRelService extends BaseService {
  /**
   * Busca elementos de um componente
   */
  async findByComponenteId(componenteId, pagination = {}) {
    return this.findAll({ cer_com_id: componenteId }, pagination);
  }

  /**
   * Busca componentes que usam um elemento
   */
  async findByElementoId(elementoId, pagination = {}) {
    return this.findAll({ cer_ele_id: elementoId }, pagination);
  }

  /**
   * Adiciona elemento ao componente
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
   */
  async reorderElements(componenteId, order) {
    for (let i = 0; i < order.length; i++) {
      await this.update(order[i], { cer_posicao: i });
    }
    return true;
  }
}
