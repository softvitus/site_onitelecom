/**
 * Textos Service
 * Lógica de negócio para textos/conteúdo
 */

import { BaseService } from './BaseService.js';
import { ApiError, ERROR_CODES } from '../utils/ErrorCodes.js';

export class TextosService extends BaseService {
  /**
   * Busca textos de um tema
   */
  async findByTemaId(temaId, pagination = {}) {
    return this.findAll({ txt_tem_id: temaId }, pagination);
  }

  /**
   * Busca textos de uma página
   */
  async findByPaginaId(paginaId, pagination = {}) {
    return this.findAll({ txt_pag_id: paginaId }, pagination);
  }

  /**
   * Busca texto por chave
   */
  async findByKey(key) {
    const item = await this.model.findOne({
      where: { txt_chave: key },
    });

    if (!item) {
      throw new ApiError('NOT_FOUND', 'Texto não encontrado');
    }

    return item;
  }

  /**
   * Busca textos por tipo
   */
  async findByType(type, pagination = {}) {
    return this.findAll({ txt_tipo: type }, pagination);
  }

  /**
   * Lista tipos de textos
   */
  getValidTypes() {
    return [
      'titulo',
      'descricao',
      'paragrafo',
      'botao',
      'label',
      'placeholder',
      'validacao',
      'outro',
    ];
  }

  /**
   * Cria texto com validação
   */
  async createValidated(data) {
    if (!this.getValidTypes().includes(data.txt_tipo)) {
      throw new ApiError('INVALID', 'Tipo de texto inválido');
    }

    return this.create(data);
  }

  /**
   * Busca por termo (search simples)
   */
  async search(termo, pagination = {}) {
    return this.query()
      .search(['txt_chave', 'txt_conteudo'], termo)
      .paginate(pagination.page || 1, pagination.limit || 10)
      .paginated();
  }
}
