/**
 * @module services/TemaService
 * @description Serviço de gerenciamento de temas
 */

import { BaseService } from './BaseService.js';
import { ApiError } from '../utils/ErrorCodes.js';
import { Op } from 'sequelize';

/**
 * Serviço de gerenciamento de Temas
 * @extends BaseService
 */
export class TemaService extends BaseService {
  /**
   * Override findAll para converter parceiroId para tem_par_id
   * @param {Object} filters - Filtros de busca
   * @param {Object} pagination - Opções de paginação
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Object>} Lista paginada de temas
   */
  async findAll(filters = {}, pagination = {}, options = {}) {
    // Converter parceiroId para tem_par_id se presente
    if (filters.parceiroId) {
      filters.tem_par_id = filters.parceiroId;
      delete filters.parceiroId;
    }
    
    return super.findAll(filters, pagination, options);
  }

  /**
   * Busca tema com todas relações
   * @param {string} id - ID do tema
   * @returns {Promise<Object>} Tema com relações
   */
  async findByIdWithRelations(id) {
    return this.findById(id, {
      include: [
        { association: 'parceiro' },
        { association: 'paginas' },
        { association: 'cores' },
        { association: 'imagens' },
        { association: 'configTemas' },
      ],
    });
  }

  /**
   * Busca temas de um parceiro
   * @param {string} parceiroId - ID do parceiro
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de temas
   */
  async findByParceiroId(parceiroId, pagination = {}) {
    return this.findAll({ tem_par_id: parceiroId }, pagination);
  }

  /**
   * Busca tema por nome
   * @param {string} name - Nome do tema
   * @returns {Promise<Object>} Tema encontrado
   * @throws {ApiError} NOT_FOUND se tema não existir
   */
  async findByName(name) {
    const item = await this.model.findOne({
      where: { tem_nome: name },
    });

    if (!item) {
      throw new ApiError('NOT_FOUND', 'Tema não encontrado');
    }

    return item;
  }

  /**
   * Valida se nome é único para o parceiro
   * @param {string} name - Nome do tema
   * @param {string} parceiroId - ID do parceiro
   * @param {string|null} excludeId - ID a excluir da validação
   * @returns {Promise<boolean>} True se único
   */
  async isNameUniqueForParceiro(name, parceiroId, excludeId = null) {
    const where = {
      tem_nome: name,
      tem_par_id: parceiroId,
    };

    if (excludeId) {
      where.tem_id = { [Op.ne]: excludeId };
    }

    const existing = await this.model.findOne({ where });
    return !existing;
  }

  /**
   * Clona um tema existente com novo nome
   * @param {string} id - ID do tema original
   * @param {string} newName - Nome para o tema clonado
   * @returns {Promise<Object>} Tema clonado
   * @throws {ApiError} NOT_FOUND se tema original não existir
   */
  async cloneTheme(id, newName) {
    const original = await this.findById(id);

    if (!original) {
      throw new ApiError('NOT_FOUND', 'Tema original não encontrado');
    }

    // Formata data no padrão DD/MM/YYYY
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const clonedName = `${newName} (${dateStr})`;

    const cloned = await this.create({
      tem_nome: clonedName,
      tem_par_id: original.tem_par_id,
    });

    return cloned;
  }
}

export default TemaService;
