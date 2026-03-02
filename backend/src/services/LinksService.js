/**
 * @module services/LinksService
 * @description Serviço de gerenciamento de links
 */

import { BaseService } from './BaseService.js';
import { ApiError } from '../utils/ErrorCodes.js';

/**
 * Serviço de gerenciamento de Links
 * @extends BaseService
 */
export class LinksService extends BaseService {
  /**
   * Tipos de link válidos
   * @type {string[]}
   */
  static VALID_TYPES = ['social', 'externo', 'interno', 'email', 'telefone', 'download'];

  /**
   * Busca links de um tema
   * @param {string} temaId - ID do tema
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de links
   */
  async findByTemaId(temaId, pagination = {}) {
    return this.findAll({ lin_tem_id: temaId }, pagination);
  }

  /**
   * Busca links de uma página
   * @param {string} paginaId - ID da página
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de links
   */
  async findByPaginaId(paginaId, pagination = {}) {
    return this.findAll({ lin_pag_id: paginaId }, pagination);
  }

  /**
   * Busca links por tipo
   * @param {string} type - Tipo do link
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de links
   */
  async findByType(type, pagination = {}) {
    return this.findAll({ lin_tipo: type }, pagination);
  }

  /**
   * Valida URL
   * @param {string} url - URL a validar
   * @returns {boolean} True se válida
   */
  validateUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Retorna tipos de link válidos
   * @returns {string[]} Lista de tipos
   */
  getValidTypes() {
    return LinksService.VALID_TYPES;
  }

  /**
   * Valida tipo de link
   * @param {string} type - Tipo a validar
   * @returns {boolean} True se válido
   */
  validateType(type) {
    return LinksService.VALID_TYPES.includes(type);
  }

  /**
   * Cria link com validação
   * @param {Object} data - Dados do link
   * @returns {Promise<Object>} Link criado
   * @throws {ApiError} VALIDATION_ERROR se dados inválidos
   */
  async createValidated(data) {
    if (!this.validateType(data.lin_tipo)) {
      throw new ApiError('VALIDATION_ERROR', 'Tipo de link inválido');
    }

    if (data.lin_tipo !== 'email' && data.lin_tipo !== 'telefone') {
      if (!this.validateUrl(data.lin_url)) {
        throw new ApiError('VALIDATION_ERROR', 'URL inválida');
      }
    }

    return this.create(data);
  }

  /**
   * Lista links sociais
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de links sociais
   */
  async findSocialLinks(pagination = {}) {
    return this.findByType('social', pagination);
  }
}

export default LinksService;
