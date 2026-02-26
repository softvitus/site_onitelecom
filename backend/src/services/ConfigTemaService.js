/**
 * ConfigTema Service
 * Lógica de negócio para configurações de tema
 */

import { BaseService } from './BaseService.js';
import { ApiError, ERROR_CODES } from '../utils/ErrorCodes.js';

export class ConfigTemaService extends BaseService {
  /**
   * Busca configuração tema com relações
   */
  async findByIdWithRelations(id) {
    return this.findById(id, {
      include: [{ association: 'tema' }],
    });
  }

  /**
   * Busca configurações de um tema
   */
  async findByTemaId(temaId, pagination = {}) {
    return this.findAll({ cte_tem_id: temaId }, pagination);
  }

  /**
   * Busca configuração por chave
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
   * Exporta todas configurações de um tema
   */
  async exportConfig(temaId) {
    const configs = await this.findByTemaId(temaId);
    const exported = {};

    configs.forEach((c) => {
      exported[c.cte_chave] = c.cte_valor;
    });

    return exported;
  }

  /**
   * Importa configurações para um tema
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
