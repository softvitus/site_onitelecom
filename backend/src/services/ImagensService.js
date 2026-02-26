/**
 * Imagens Service
 * Lógica de negócio para imagens
 */

import { BaseService } from './BaseService.js';
import { ApiError, ERROR_CODES } from '../utils/ErrorCodes.js';

export class ImagensService extends BaseService {
  /**
   * Busca imagens de um tema
   */
  async findByTemaId(temaId, pagination = {}) {
    return this.findAll({ img_tem_id: temaId }, pagination);
  }

  /**
   * Busca imagens de uma página
   */
  async findByPaginaId(paginaId, pagination = {}) {
    return this.findAll({ img_pag_id: paginaId }, pagination);
  }

  /**
   * Busca imag por tipo
   */
  async findByType(type, pagination = {}) {
    return this.findAll({ img_tipo: type }, pagination);
  }

  /**
   * Valida tipos de imagem permitidos
   */
  getValidTypes() {
    return ['banner', 'logo', 'icone', 'thumbnail', 'background', 'custom'];
  }

  /**
   * Valida tipo de imagem
   */
  validateType(type) {
    return this.getValidTypes().includes(type);
  }

  /**
   * Registra upload de imagem
   */
  async recordUpload(data) {
    if (!this.validateType(data.img_tipo)) {
      throw new ApiError('INVALID', 'Tipo de imagem inválido');
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
   * Deleta imagem e limpa referências
   */
  async deleteImage(id) {
    const imagem = await this.findById(id);
    // TODO: Deletar arquivo físico do storage
    return this.delete(id);
  }
}
