/**
 * @module services/ConfigTemaService
 * @description Serviço de gerenciamento de configurações de tema
 */

import { BaseService } from './BaseService.js';
import { ApiError } from '../utils/ErrorCodes.js';

/**
 * Serviço de gerenciamento de Configurações de Tema
 * @extends BaseService
 */
export class ConfigTemaService extends BaseService {
  /**
   * Busca configuração com relações
   * @param {string} id - ID da configuração
   * @returns {Promise<Object>} Configuração com tema
   */
  async findByIdWithRelations(id) {
    return this.findById(id, {
      include: [{ association: 'tema' }],
    });
  }

  /**
   * Busca configurações de um tema
   * @param {string} temaId - ID do tema
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de configurações
   */
  async findByTemaId(temaId, pagination = {}) {
    return this.findAll({ cte_tem_id: temaId }, pagination);
  }

  /**
   * Busca configuração por chave
   * @param {string} key - Chave da configuração
   * @returns {Promise<Object>} Configuração encontrada
   * @throws {ApiError} NOT_FOUND se não existir
   */
  async findByKey(key) {
    const item = await this.model.findOne({
      where: { cte_chave: key },
    });

    if (!item) {
      throw new ApiError('NOT_FOUND', 'Configuração não encontrada');
    }

    return item;
  }

  /**
   * Obtém valor de configuração
   * @param {string} temaId - ID do tema
   * @param {string} key - Chave da configuração
   * @returns {Promise<string|null>} Valor ou null
   */
  async getValue(temaId, key) {
    const config = await this.model.findOne({
      where: {
        cte_tem_id: temaId,
        cte_chave: key,
      },
    });

    return config ? config.cte_valor : null;
  }

  /**
   * Define valor de configuração
   * @param {string} temaId - ID do tema
   * @param {string} key - Chave da configuração
   * @param {string} value - Valor a definir
   * @returns {Promise<Object>} Configuração atualizada/criada
   */
  async setValue(temaId, key, value) {
    const existing = await this.model.findOne({
      where: {
        cte_tem_id: temaId,
        cte_chave: key,
      },
    });

    if (existing) {
      return this.update(existing.cte_id, {
        cte_valor: value,
      });
    }

    return this.create({
      cte_tem_id: temaId,
      cte_chave: key,
      cte_valor: value,
    });
  }

  /**
   * Exporta configurações de um tema
   * @param {string} temaId - ID do tema
   * @returns {Promise<Object>} Objeto com configurações
   */
  async exportConfig(temaId) {
    const result = await this.findByTemaId(temaId);
    const exported = {};

    result.rows.forEach((c) => {
      exported[c.cte_chave] = c.cte_valor;
    });

    return exported;
  }

  /**
   * Importa configurações para um tema
   * @param {string} temaId - ID do tema
   * @param {Object} configData - Dados de configuração
   * @returns {Promise<Object[]>} Configurações importadas
   */
  async importConfig(temaId, configData) {
    const imported = [];

    for (const [key, value] of Object.entries(configData)) {
      const result = await this.setValue(temaId, key, value);
      imported.push(result);
    }

    return imported;
  }
}

export default ConfigTemaService;
