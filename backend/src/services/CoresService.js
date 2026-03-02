/**
 * @module services/CoresService
 * @description Serviço de gerenciamento de paleta de cores
 */

import { BaseService } from './BaseService.js';
import { ApiError } from '../utils/ErrorCodes.js';

/**
 * Serviço de gerenciamento de Cores
 * @extends BaseService
 */
export class CoresService extends BaseService {
  /**
   * Regex para validação de cor HEX
   * @type {RegExp}
   */
  static HEX_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  /**
   * Regex para validação de cor RGB
   * @type {RegExp}
   */
  static RGB_REGEX = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;

  /**
   * Busca cores de um tema
   * @param {string} temaId - ID do tema
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de cores
   */
  async findByTemaId(temaId, pagination = {}) {
    return this.findAll({ cor_tem_id: temaId }, pagination);
  }

  /**
   * Busca cor por nome
   * @param {string} name - Nome da cor
   * @returns {Promise<Object>} Cor encontrada
   * @throws {ApiError} NOT_FOUND se não existir
   */
  async findByName(name) {
    const item = await this.model.findOne({
      where: { cor_nome: name },
    });

    if (!item) {
      throw new ApiError('NOT_FOUND', 'Cor não encontrada');
    }

    return item;
  }

  /**
   * Valida formato de cor HEX
   * @param {string} hex - Cor em formato HEX
   * @returns {boolean} True se válido
   */
  validateHexColor(hex) {
    return CoresService.HEX_REGEX.test(hex);
  }

  /**
   * Valida formato RGB
   * @param {string} rgb - Cor em formato RGB
   * @returns {boolean} True se válido
   */
  validateRGBColor(rgb) {
    return CoresService.RGB_REGEX.test(rgb);
  }

  /**
   * Exporta paleta como JSON
   * @param {string} temaId - ID do tema
   * @returns {Promise<Object>} Paleta exportada
   */
  async exportPalette(temaId) {
    const result = await this.findByTemaId(temaId);
    return {
      tema_id: temaId,
      cores: result.rows.map((c) => ({
        nome: c.cor_nome,
        hex: c.cor_hex,
        rgb: c.cor_rgb,
      })),
    };
  }

  /**
   * Importa paleta de cores
   * @param {string} temaId - ID do tema
   * @param {Object} paletaData - Dados da paleta
   * @returns {Promise<Object[]>} Cores importadas
   */
  async importPalette(temaId, paletaData) {
    const imported = [];
    for (const cor of paletaData.cores) {
      const created = await this.create({
        cor_tem_id: temaId,
        cor_nome: cor.nome,
        cor_hex: cor.hex,
        cor_rgb: cor.rgb,
      });
      imported.push(created);
    }
    return imported;
  }
}

export default CoresService;
