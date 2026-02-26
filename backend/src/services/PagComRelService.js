/**
 * PagComRel Service
 * Lógica para relacionamento Página-Componente
 */

import { BaseService } from './BaseService.js';
import { ApiError, ERROR_CODES } from '../utils/ErrorCodes.js';

export class PagComRelService extends BaseService {
  /**
   * Busca componentes de uma página
   */
  async findByPaginaId(paginaId, pagination = {}) {
    return this.findAll({ pcr_pag_id: paginaId }, pagination);
  }

  /**
   * Busca páginas que usam um componente
   */
  async findByComponenteId(componenteId, pagination = {}) {
    return this.findAll({ pcr_com_id: componenteId }, pagination);
  }

  /**
   * Adiciona componente à página em posição específica
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
   */
  async reorderComponents(paginaId, order) {
    for (let i = 0; i < order.length; i++) {
      await this.update(order[i], { pcr_posicao: i });
    }
    return true;
  }
}
