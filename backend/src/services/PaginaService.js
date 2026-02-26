/**
 * Página Service
 * Lógica de negócio para páginas
 */

import { BaseService } from './BaseService.js';
import { ApiError, ERROR_CODES } from '../utils/ErrorCodes.js';

export class PaginaService extends BaseService {
  /**
   * Busca página com todas relações (componentes, tema, etc)
   */
  async findByIdWithRelations(id) {
    return this.findById(id, {
      include: [
        { association: 'tema' },
        { association: 'parceiro' },
        { association: 'componentes' },
        { association: 'conteudos' },
      ],
    });
  }

  /**
   * Busca páginas de um tema
   */
  async findByTemaId(temaId, pagination = {}) {
    return this.findAll({ pag_tem_id: temaId }, pagination);
  }

  /**
   * Busca página por caminho (URL)
   */
  async findByPath(path) {
    const item = await this.model.findOne({
      where: { pag_caminho: path },
    });

    if (!item) {
      throw new ApiError('NOT_FOUND', 'Página não encontrada');
    }

    return item;
  }

  /**
   * Lista páginas de um parceiro
   */
  async findByParceiroId(parceiroId, pagination = {}) {
    return this.findAll({ pag_par_id: parceiroId }, pagination);
  }

  /**
   * Valida unicidade de caminho
   */
  async validateUniquePath(path, excludeId = null) {
    const query = { pag_caminho: path };
    if (excludeId) {
      query.pag_id = { $ne: excludeId };
    }

    const existing = await this.model.findOne({ where: query });
    return !existing;
  }
}
