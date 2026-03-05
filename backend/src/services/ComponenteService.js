/**
 * @module services/ComponenteService
 * @description Serviço de gerenciamento de componentes
 */

import { BaseService } from './BaseService.js';
import { ApiError } from '../utils/ErrorCodes.js';

/**
 * Serviço de gerenciamento de Componentes
 * @extends BaseService
 */
export class ComponenteService extends BaseService {
  /**
   * Override findAll para filtrar por parceiro através de páginas
   * @param {Object} filters - Filtros de busca
   * @param {Object} pagination - Opções de paginação
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Object>} Lista paginada de componentes
   */
  async findAll(filters = {}, pagination = {}, options = {}) {
    // Se filtrar por parceiroId, fazer include da página para filtrar pelo parceiro
    if (filters.parceiroId) {
      options.include = options.include || [];
      options.include.push({
        association: 'paginas',
        where: { pag_par_id: filters.parceiroId },
        required: true,
        through: { attributes: [] }, // Não incluir atributos da tabela de junção
      });
      delete filters.parceiroId;
    }
    
    return super.findAll(filters, pagination, options);
  }

  /**
   * Busca componente com todas relações
   * @param {string} id - ID do componente
   * @returns {Promise<Object>} Componente com relações
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
   * @param {string} paginaId - ID da página
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de componentes
   */
  async findByPaginaId(paginaId, pagination = {}) {
    return this.findAll({ com_pag_id: paginaId }, pagination);
  }

  /**
   * Busca componente por nome
   * @param {string} name - Nome do componente
   * @returns {Promise<Object>} Componente encontrado
   * @throws {ApiError} NOT_FOUND se não existir
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
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada
   */
  async findReusable(pagination = {}) {
    return this.findAll({ com_reutilizavel: true }, pagination);
  }

  /**
   * Conta elementos de um componente
   * @param {string} componenteId - ID do componente
   * @returns {Promise<number>} Quantidade de elementos
   */
  async countElements(componenteId) {
    const componente = await this.findById(componenteId);
    return componente.elementos?.length || 0;
  }
}

export default ComponenteService;
