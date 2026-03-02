/**
 * @module services/FeaturesService
 * @description Serviço de gerenciamento de features/funcionalidades
 */

import { BaseService } from './BaseService.js';

/**
 * Serviço de gerenciamento de Features
 * @extends BaseService
 */
export class FeaturesService extends BaseService {
  /**
   * Tipos de feature válidos
   * @type {string[]}
   */
  static VALID_TYPES = ['analytics', 'seo', 'seguranca', 'performance', 'integracao', 'automacao'];

  /**
   * Busca features de um tema
   * @param {string} temaId - ID do tema
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de features
   */
  async findByTemaId(temaId, pagination = {}) {
    return this.findAll({ fea_tem_id: temaId }, pagination);
  }

  /**
   * Busca features ativas
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de features ativas
   */
  async findActive(pagination = {}) {
    return this.findAll({ fea_ativo: true }, pagination);
  }

  /**
   * Busca features por tipo
   * @param {string} type - Tipo da feature
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de features
   */
  async findByType(type, pagination = {}) {
    return this.findAll({ fea_tipo: type }, pagination);
  }

  /**
   * Retorna tipos de feature válidos
   * @returns {string[]} Lista de tipos
   */
  getValidTypes() {
    return FeaturesService.VALID_TYPES;
  }

  /**
   * Verifica se feature está habilitada
   * @param {string} featureKey - Chave da feature
   * @returns {Promise<boolean>} True se habilitada
   */
  async isEnabled(featureKey) {
    const feature = await this.model.findOne({
      where: {
        fea_chave: featureKey,
        fea_ativo: true,
      },
    });

    return !!feature;
  }

  /**
   * Habilita feature
   * @param {string} id - ID da feature
   * @returns {Promise<Object>} Feature habilitada
   */
  async enableFeature(id) {
    return this.update(id, { fea_ativo: true });
  }

  /**
   * Desabilita feature
   * @param {string} id - ID da feature
   * @returns {Promise<Object>} Feature desabilitada
   */
  async disableFeature(id) {
    return this.update(id, { fea_ativo: false });
  }

  /**
   * Toggle feature
   * @param {string} id - ID da feature
   * @returns {Promise<Object>} Feature atualizada
   */
  async toggleFeature(id) {
    const feature = await this.findById(id);
    return this.update(id, { fea_ativo: !feature.fea_ativo });
  }
}

export default FeaturesService;