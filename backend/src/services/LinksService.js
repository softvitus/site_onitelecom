/**
 * Links Service
 * Lógica de negócio para links/referências
 */

import { BaseService } from './BaseService.js';
import { ApiError, ERROR_CODES } from '../utils/ErrorCodes.js';

export class LinksService extends BaseService {
  /**
   * Busca links de um tema
   */
  async findByTemaId(temaId, pagination = {}) {
    return this.findAll({ lin_tem_id: temaId }, pagination);
  }

  /**
   * Busca links de uma página
   */
  async findByPaginaId(paginaId, pagination = {}) {
    return this.findAll({ lin_pag_id: paginaId }, pagination);
  }

  /**
   * Busca link por tipo
   */
  async findByType(type, pagination = {}) {
    return this.findAll({ lin_tipo: type }, pagination);
  }

  /**
   * Valida URL
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
   * Tipos de links suportados
   */
  getValidTypes() {
    return [
      'social',
      'externo',
      'interno',
      'email',
      'telefone',
      'download',
    ];
  }

  /**
   * Valida tipo de link
   */
  validateType(type) {
    return this.getValidTypes().includes(type);
  }

  /**
   * Cria link com validação
   */
  async createValidated(data) {
    if (!this.validateType(data.lin_tipo)) {
      throw new ApiError('INVALID', 'Tipo de link inválido');
    }

    if (data.lin_tipo !== 'email' && data.lin_tipo !== 'telefone') {
      if (!this.validateUrl(data.lin_url)) {
        throw new ApiError('INVALID', 'URL inválida');
      }
    }

    return this.create(data);
  }

  /**
   * Lista links sociais
   */
  async findSocialLinks(pagination = {}) {
    return this.findByType('social', pagination);
  }
}
