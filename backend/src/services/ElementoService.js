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
   * Busca elemento com todas relações
   * @param {string} id - ID do elemento
   * @returns {Promise<Object>} Elemento com relações
   */
  async findByIdWithRelations(id) {
    return this.findById(id, {
      include: [
        { association: 'componentes' },
        { association: 'conteudos' },
      ],
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
