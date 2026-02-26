/**
 * Tema Service
 * Lógica de negócio para temas
 */


import { BaseService } from './BaseService.js';
import { ApiError, ERROR_CODES } from '../utils/ErrorCodes.js';

export class TemaService extends BaseService {
  /**
   * Busca tema com todas relações (páginas, cores, imagens, etc)
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
   */
  async findByParceiroId(parceiroId, pagination = {}) {
    return this.findAll({ tem_par_id: parceiroId }, pagination);
  }

  /**
   * Busca tema por nome
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
   * Clona um tema existente
   */
  async cloneTheme(id, newName) {
    const theme = await this.findById(id);
    const clone = await this.create({
      tem_par_id: theme.tem_par_id,
      tem_nome: `${newName} (${new Date().toLocaleDateString()})`,
    });

    return clone;
  }

}
