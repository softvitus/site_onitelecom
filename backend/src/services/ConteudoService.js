/**
 * @module services/ConteudoService
 * @description Serviço de gerenciamento de conteúdo dinâmico
 */

import { BaseService } from './BaseService.js';

/**
 * Serviço de gerenciamento de Conteúdo
 * @extends BaseService
 */
export class ConteudoService extends BaseService {
  /**
   * Override findAll para filtrar por parceiro através do tema
   * @param {Object} filters - Filtros de busca
   * @param {Object} pagination - Opções de paginação
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Object>} Lista paginada de conteúdos
   */
  async findAll(filters = {}, pagination = {}, options = {}) {
    // Se filtrar por parceiroId, fazer include do tema para filtrar pelo parceiro
    if (filters.parceiroId) {
      options.include = options.include || [];
      options.include.push({
        association: 'tema',
        where: { tem_par_id: filters.parceiroId },
        required: true,
      });
      delete filters.parceiroId;
    }
    
    return super.findAll(filters, pagination, options);
  }

  /**
   * Busca conteúdo com relações
   * @param {string} id - ID do conteúdo
   * @returns {Promise<Object>} Conteúdo com página, elemento e componente
   */
  async findByIdWithRelations(id) {
    return this.findById(id, {
      include: [
        { association: 'pagina' },
        { association: 'elemento' },
        { association: 'componente' },
      ],
    });
  }

  /**
   * Busca conteúdo de uma página
   * @param {string} paginaId - ID da página
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de conteúdos
   */
  async findByPaginaId(paginaId, pagination = {}) {
    return this.findAll({ con_pag_id: paginaId }, pagination);
  }

  /**
   * Busca conteúdo de um componente
   * @param {string} componenteId - ID do componente
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de conteúdos
   */
  async findByComponenteId(componenteId, pagination = {}) {
    return this.findAll({ con_com_id: componenteId }, pagination);
  }

  /**
   * Busca conteúdo de um elemento
   * @param {string} elementoId - ID do elemento
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de conteúdos
   */
  async findByElementoId(elementoId, pagination = {}) {
    return this.findAll({ con_ele_id: elementoId }, pagination);
  }

  /**
   * Atualiza com versionamento
   * @param {string} id - ID do conteúdo
   * @param {Object} data - Novos dados
   * @returns {Promise<Object>} Conteúdo atualizado
   */
  async updateWithVersion(id, data) {
    const current = await this.findById(id);

    // Salvar versão anterior
    await this.create({
      con_pag_id: current.con_pag_id,
      con_com_id: current.con_com_id,
      con_ele_id: current.con_ele_id,
      con_valor: current.con_valor,
      con_versao: (current.con_versao || 0) + 1,
      con_ativo: false,
    });

    // Atualizar com novos dados
    return this.update(id, {
      ...data,
      con_versao: (current.con_versao || 0) + 1,
    });
  }

  /**
   * Ativa conteúdo
   * @param {string} id - ID do conteúdo
   * @returns {Promise<Object>} Conteúdo ativado
   */
  async activate(id) {
    return this.update(id, { con_ativo: true });
  }

  /**
   * Desativa conteúdo
   * @param {string} id - ID do conteúdo
   * @returns {Promise<Object>} Conteúdo desativado
   */
  async deactivate(id) {
    return this.update(id, { con_ativo: false });
  }
}

export default ConteudoService;