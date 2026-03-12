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
   * Regex para validação de gradient
   * @type {RegExp}
   */
  static GRADIENT_REGEX = /^linear-gradient\(/;

  /**
   * Regex para validação de variável CSS
   * @type {RegExp}
   */
  static CSS_VAR_REGEX = /^var\(--[a-z0-9-]+\)$/i;

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
   * Busca cores por componente
   * @param {string} componente - Nome do componente (ex: Header, Ofertas)
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de cores
   */
  async findByComponente(componente, pagination = {}) {
    return this.findAll({ cor_componente: componente }, pagination);
  }

  /**
   * Busca cores por categoria
   * @param {string} categoria - Categoria (ex: componente, primaria, status)
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de cores
   */
  async findByCategoria(categoria, pagination = {}) {
    return this.findAll({ cor_categoria: categoria }, pagination);
  }

  /**
   * Busca apenas cores ativas de um tema
   * @param {string} temaId - ID do tema
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de cores ativas
   */
  async findAtivas(temaId, pagination = {}) {
    return this.findAll({ cor_tem_id: temaId, cor_ativo: true }, pagination);
  }

  /**
   * Busca cores ativas por componente
   * @param {string} componente - Nome do componente
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de cores ativas
   */
  async findAtivasByComponente(componente, pagination = {}) {
    return this.findAll(
      { cor_componente: componente, cor_ativo: true },
      pagination,
    );
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
   * Valida se é um gradient válido
   * @param {string} gradient - String de gradient
   * @returns {boolean} True se válido
   */
  validateGradient(gradient) {
    return CoresService.GRADIENT_REGEX.test(gradient);
  }

  /**
   * Valida se é uma variável CSS válida
   * @param {string} varRef - Referência da variável
   * @returns {boolean} True se válido
   */
  validateCssVariable(varRef) {
    return CoresService.CSS_VAR_REGEX.test(varRef);
  }

  /**
   * Valida o valor da cor (HEX, RGB, gradient ou transparent)
   * @param {string} valor - Valor da cor
   * @returns {boolean} True se válido
   */
  validateColorValue(valor) {
    if (!valor) {
      return false;
    }

    // Aceita HEX, RGB, gradient, transparent ou white/blue/etc
    if (valor === 'transparent') {
      return true;
    }
    if (/^(white|black|blue|red|green|yellow|transparent)$/i.test(valor)) {
      return true;
    }

    return (
      this.validateHexColor(valor) ||
      this.validateRGBColor(valor) ||
      this.validateGradient(valor)
    );
  }

  /**
   * Valida os dados de uma cor antes de criar/atualizar
   * @param {Object} data - Dados da cor
   * @returns {Object} Objeto com validação e erros
   */
  validateCorData(data) {
    const errors = [];

    // Validações obrigatórias
    if (!data.cor_nome || data.cor_nome.trim() === '') {
      errors.push('cor_nome é obrigatório');
    }
    if (!data.cor_valor || data.cor_valor.trim() === '') {
      errors.push('cor_valor é obrigatório');
    }
    if (!data.cor_categoria || data.cor_categoria.trim() === '') {
      errors.push('cor_categoria é obrigatório');
    }

    // Validações de formato
    if (data.cor_valor && !this.validateColorValue(data.cor_valor)) {
      errors.push(
        'cor_valor deve ser HEX, RGB, gradient ou valor nomeado válido',
      );
    }

    // Validações opcionais
    if (
      data.cor_variavel_ref &&
      !this.validateCssVariable(data.cor_variavel_ref)
    ) {
      errors.push('cor_variavel_ref não é uma variável CSS válida');
    }

    if (data.cor_ativo !== undefined && typeof data.cor_ativo !== 'boolean') {
      errors.push('cor_ativo deve ser boolean');
    }

    if (data.cor_componente && data.cor_componente.trim() === '') {
      errors.push('cor_componente não pode estar vazio');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
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
      totalCores: result.rows.length,
      cores: result.rows.map((c) => ({
        id: c.cor_id,
        nome: c.cor_nome,
        valor: c.cor_valor,
        categoria: c.cor_categoria,
        componente: c.cor_componente,
        variavel_ref: c.cor_variavel_ref,
        descricao: c.cor_descricao,
        ativo: c.cor_ativo,
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
      const validation = this.validateCorData({
        ...cor,
        cor_tem_id: temaId,
      });

      if (!validation.isValid) {
        throw new ApiError(
          'VALIDATION_ERROR',
          `Erro ao importar cor "${cor.cor_nome}": ${validation.errors.join(', ')}`,
        );
      }

      const created = await this.create({
        cor_tem_id: temaId,
        cor_nome: cor.nome || cor.cor_nome,
        cor_valor: cor.valor || cor.cor_valor,
        cor_categoria: cor.categoria || cor.cor_categoria,
        cor_componente: cor.componente || cor.cor_componente,
        cor_variavel_ref: cor.variavel_ref || cor.cor_variavel_ref,
        cor_descricao: cor.descricao || cor.cor_descricao,
        cor_ativo: cor.ativo !== undefined ? cor.ativo : true,
      });
      imported.push(created);
    }
    return imported;
  }
}

export default CoresService;
