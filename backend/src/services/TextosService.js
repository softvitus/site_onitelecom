/**
 * @module services/TextosService
 * @description Serviço de gerenciamento de textos
 */

import { BaseService } from './BaseService.js';
import { ApiError } from '../utils/ErrorCodes.js';

/**
 * Serviço de gerenciamento de Textos
 * @extends BaseService
 */
export class TextosService extends BaseService {
  /**
   * Tipos de texto válidos
   * @type {string[]}
   */
  static VALID_TYPES = ['titulo', 'descricao', 'paragrafo', 'botao', 'label', 'placeholder', 'validacao', 'outro'];

  /**
   * Override findAll para filtrar por parceiro através do tema
   * @param {Object} filters - Filtros de busca
   * @param {Object} pagination - Opções de paginação
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Object>} Lista paginada de textos
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
   * Busca textos de um tema
   * @param {string} temaId - ID do tema
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de textos
   */
  async findByTemaId(temaId, pagination = {}) {
    return this.findAll({ txt_tem_id: temaId }, pagination);
  }

  /**
   * Busca textos de uma página
   * @param {string} paginaId - ID da página
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de textos
   */
  async findByPaginaId(paginaId, pagination = {}) {
    return this.findAll({ txt_pag_id: paginaId }, pagination);
  }

  /**
   * Busca texto por chave
   * @param {string} key - Chave do texto
   * @returns {Promise<Object>} Texto encontrado
   * @throws {ApiError} NOT_FOUND se não existir
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
   * @param {string} type - Tipo do texto
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de textos
   */
  async findByType(type, pagination = {}) {
    return this.findAll({ txt_tipo: type }, pagination);
  }

  /**
   * Retorna tipos de texto válidos
   * @returns {string[]} Lista de tipos
   */
  getValidTypes() {
    return TextosService.VALID_TYPES;
  }

  /**
   * Cria texto com validação
   * @param {Object} data - Dados do texto
   * @returns {Promise<Object>} Texto criado
   * @throws {ApiError} VALIDATION_ERROR se tipo inválido
   */
  async createValidated(data) {
    if (!TextosService.VALID_TYPES.includes(data.txt_tipo)) {
      throw new ApiError('VALIDATION_ERROR', 'Tipo de texto inválido');
    }

    return this.create(data);
  }

  /**
   * Busca textos por termo
   * @param {string} termo - Termo de busca
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de resultados
   */
  async search(termo, pagination = {}) {
    return this.query()
      .search(['txt_chave', 'txt_conteudo'], termo)
      .paginate(pagination.page || 1, pagination.limit || 10)
      .paginated();
  }
}

export default TextosService;
