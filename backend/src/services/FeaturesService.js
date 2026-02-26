/**
 * Features Service
 * Lógica de negócio para features/funcionalidades
 */

import { BaseService } from './BaseService.js';
import { ApiError, ERROR_CODES } from '../utils/ErrorCodes.js';

export class FeaturesService extends BaseService {
  /**
   * Busca features de um tema
   */
  async findByTemaId(temaId, pagination = {}) {
    return this.findAll({ fea_tem_id: temaId }, pagination);
  }

  /**
   * Busca features ativas
   */
  async findActive(pagination = {}) {
    return this.findAll({ fea_ativo: true }, pagination);
  }

  /**
   * Busca features por tipo
   */
  async findByType(type, pagination = {}) {
    return this.findAll({ fea_tipo: type }, pagination);
  }

  /**
   * Lista tipos de features disponíveis
   */
  getValidTypes() {
    return [
      'analytics',
      'seo',
      'seguranca',
      'performance',
      'integracao',
      'automacao',
    ];
  }

  /**
   * Verifica se feature está habilitada
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
   */
  async enableFeature(id) {
    return this.update(id, { fea_ativo: true });
  }

  /**
   * Desabilita feature
   */
  async disableFeature(id) {
    return this.update(id, { fea_ativo: false });
  }

  /**
   * Toggle feature
   */
  async toggleFeature(id) {
    const feature = await this.findById(id);
    return this.update(id, { fea_ativo: !feature.fea_ativo });
  }
}
