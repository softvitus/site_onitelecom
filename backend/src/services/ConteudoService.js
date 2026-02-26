/**
 * Conteúdo Service
 * Lógica de negócio para conteúdo dinâmico
 */

import { BaseService } from './BaseService.js';
import { ApiError, ERROR_CODES } from '../utils/ErrorCodes.js';

export class ConteudoService extends BaseService {
  /**
   * Busca conteúdo com relações
   */
  async findByIdWithRelations(id) {
    return this.findById(id, {
      include: [
        { association: 'pagina' },
        { association: 'elemento' },
        { association: 'componente' },
      ],
    });
  }

  /**
   * Busca conteúdo de uma página
   */
  async findByPaginaId(paginaId, pagination = {}) {
    return this.findAll({ con_pag_id: paginaId }, pagination);
  }

  /**
   * Busca conteúdo de um componente
   */
  async findByComponenteId(componenteId, pagination = {}) {
    return this.findAll({ con_com_id: componenteId }, pagination);
  }

  /**
   * Busca conteúdo de um elemento
   */
  async findByElementoId(elementoId, pagination = {}) {
    return this.findAll({ con_ele_id: elementoId }, pagination);
  }

  /**
   * Versionamento: cria versão anterior antes de atualizar
   */
  async updateWithVersion(id, data) {
    const current = await this.findById(id);

    // Salvar versão anterior
    await this.create({
      con_pag_id: current.con_pag_id,
      con_com_id: current.con_com_id,
      con_ele_id: current.con_ele_id,
      con_valor: current.con_valor,
      con_versao: (current.con_versao || 0) + 1,
      con_ativo: false, // versão antiga
    });

    // Atualizar com novos dados
    return this.update(id, {
      ...data,
      con_versao: (current.con_versao || 0) + 1,
    });
  }

  /**
   * Ativa conteúdo
   */
  async activate(id) {
    return this.update(id, { con_ativo: true });
  }

  /**
   * Desativa conteúdo
   */
  async deactivate(id) {
    return this.update(id, { con_ativo: false });
  }
}
