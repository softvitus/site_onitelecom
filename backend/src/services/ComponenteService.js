/**
 * Componente Service
 * Lógica de negócio para componentes
 */

import { BaseService } from './BaseService.js';
import { ApiError, ERROR_CODES } from '../utils/ErrorCodes.js';

export class ComponenteService extends BaseService {
  /**
   * Busca componente com todas relações
   */
  async findByIdWithRelations(id) {
    return this.findById(id, {
      include: [
        { association: 'elementos' },
        { association: 'paginas' },
        { association: 'conteudos' },
      ],
    });
  }

  /**
   * Busca componentes de uma página
   */
  async findByPaginaId(paginaId, pagination = {}) {
    return this.findAll({ com_pag_id: paginaId }, pagination);
  }

  /**
   * Busca componente por nome
   */
  async findByName(name) {
    const item = await this.model.findOne({
      where: { com_nome: name },
    });

    if (!item) {
      throw new ApiError('NOT_FOUND', 'Componente não encontrado');
    }

    return item;
  }

  /**
   * Lista componentes reutilizáveis
   */
  async findReusable(pagination = {}) {
    return this.findAll({ com_reutilizavel: true }, pagination);
  }

  /**
   * Conta elementos de um componente
   */
  async countElements(componenteId) {
    const componente = await this.findById(componenteId);
    return componente.elementos?.length || 0;
  }
}
