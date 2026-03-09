/**
 * @module services/ElementoService
 * @description Serviço de gerenciamento de elementos
 */

import { BaseService } from './BaseService.js';

/**
 * Serviço de gerenciamento de Elementos
 * @extends BaseService
 */
export class ElementoService extends BaseService {
  /**
   * Tipos de elementos disponíveis
   * @type {string[]}
   */
  static TIPOS = [
    'texto',
    'imagem',
    'botao',
    'formulario',
    'tabela',
    'lista',
    'video',
    'audio',
    'iframe',
    'custom',
  ];

  /**
   * Override findAll para filtrar por parceiro através de componentes e páginas
   * @param {Object} filters - Filtros de busca
   * @param {Object} pagination - Opções de paginação
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Object>} Lista paginada de elementos
   */
  async findAll(filters = {}, pagination = {}, options = {}) {
    // Se filtrar por parceiroId, fazer include dos componentes -> páginas para filtrar pelo parceiro
    if (filters.parceiroId) {
      options.include = options.include || [];
      options.include.push({
        association: 'componentes',
        through: { attributes: [] },
        attributes: [],
        include: [
          {
            association: 'paginas',
            where: { pag_par_id: filters.parceiroId },
            attributes: [],
            through: { attributes: [] },
            required: true,
          },
        ],
        required: true,
      });
      delete filters.parceiroId;
    }

    return super.findAll(filters, pagination, options);
  }

  /**
   * Busca elemento com todas relações
   * @param {string} id - ID do elemento
   * @returns {Promise<Object>} Elemento com relações
   */
  async findByIdWithRelations(id) {
    return this.findById(id, {
      include: [{ association: 'componentes' }, { association: 'conteudos' }],
    });
  }

  /**
   * Busca elementos de um componente
   * @param {string} componenteId - ID do componente
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de elementos
   */
  async findByComponenteId(componenteId, pagination = {}) {
    return this.findAll({ ele_com_id: componenteId }, pagination);
  }

  /**
   * Busca elementos por tipo
   * @param {string} type - Tipo do elemento
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de elementos
   */
  async findByType(type, pagination = {}) {
    return this.findAll({ ele_tipo: type }, pagination);
  }

  /**
   * Lista tipos de elementos disponíveis
   * @returns {string[]} Lista de tipos
   */
  getAvailableTypes() {
    return ElementoService.TIPOS;
  }

  /**
   * Valida tipo de elemento
   * @param {string} type - Tipo a validar
   * @returns {boolean} True se válido
   */
  validateType(type) {
    return ElementoService.TIPOS.includes(type);
  }
}

export default ElementoService;
