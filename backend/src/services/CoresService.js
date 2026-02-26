/**
 * Cores Service
 * Lógica de negócio para paleta de cores
 */

import { BaseService } from './BaseService.js';
import { ApiError, ERROR_CODES } from '../utils/ErrorCodes.js';

export class CoresService extends BaseService {
  /**
   * Busca cores de um tema
   */
  async findByTemaId(temaId, pagination = {}) {
    return this.findAll({ cor_tem_id: temaId }, pagination);
  }

  /**
   * Busca cor por nome
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
   * Valida formato de cor (hex)
   */
  validateHexColor(hex) {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(hex);
  }

  /**
   * Valida formato RGB
   */
  validateRGBColor(rgb) {
    const rgbRegex = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
    return rgbRegex.test(rgb);
  }

  /**
   * Exporta paleta como JSON
   */
  async exportPalette(temaId) {
    const cores = await this.findByTemaId(temaId);
    return {
      tema_id: temaId,
      cores: cores.map((c) => ({
        nome: c.cor_nome,
        hex: c.cor_hex,
        rgb: c.cor_rgb,
      })),
    };
  }

  /**
   * Importa paleta de cores
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
