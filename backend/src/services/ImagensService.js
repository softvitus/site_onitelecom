/**
 * @module services/ImagensService
 * @description Serviço de gerenciamento de imagens
 */

import { BaseService } from './BaseService.js';
import { ApiError } from '../utils/ErrorCodes.js';

/**
 * Serviço de gerenciamento de Imagens
 * @extends BaseService
 */
export class ImagensService extends BaseService {
  /**
   * Tipos de imagem válidos
   * @type {string[]}
   */
  static VALID_TYPES = ['banner', 'logo', 'icone', 'thumbnail', 'background', 'custom'];

  /**
   * Busca imagens de um tema
   * @param {string} temaId - ID do tema
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de imagens
   */
  async findByTemaId(temaId, pagination = {}) {
    return this.findAll({ img_tem_id: temaId }, pagination);
  }

  /**
   * Busca imagens de uma página
   * @param {string} paginaId - ID da página
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de imagens
   */
  async findByPaginaId(paginaId, pagination = {}) {
    return this.findAll({ img_pag_id: paginaId }, pagination);
  }

  /**
   * Busca imagens por tipo
   * @param {string} type - Tipo da imagem
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de imagens
   */
  async findByType(type, pagination = {}) {
    return this.findAll({ img_tipo: type }, pagination);
  }

  /**
   * Retorna tipos de imagem válidos
   * @returns {string[]} Lista de tipos
   */
  getValidTypes() {
    return ImagensService.VALID_TYPES;
  }

  /**
   * Valida tipo de imagem
   * @param {string} type - Tipo a validar
   * @returns {boolean} True se válido
   */
  validateType(type) {
    return ImagensService.VALID_TYPES.includes(type);
  }

  /**
   * Registra upload de imagem
   * @param {Object} data - Dados da imagem
   * @returns {Promise<Object>} Imagem criada
   * @throws {ApiError} VALIDATION_ERROR se tipo inválido
   */
  async recordUpload(data) {
    if (!this.validateType(data.img_tipo)) {
      throw new ApiError('VALIDATION_ERROR', 'Tipo de imagem inválido');
    }

    return this.create({
      img_tem_id: data.img_tem_id,
      img_pag_id: data.img_pag_id,
      img_nome: data.img_nome,
      img_url: data.img_url,
      img_tipo: data.img_tipo,
      img_tamanho: data.img_tamanho,
    });
  }

  /**
   * Deleta imagem
   * @param {string} id - ID da imagem
   * @returns {Promise<Object>} Imagem deletada
   */
  async deleteImage(id) {
    await this.findById(id);
    return this.delete(id);
  }
}

export default ImagensService;
