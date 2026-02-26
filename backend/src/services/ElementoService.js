/**
 * Elemento Service
 * Lógica de negócio para elementos
 */

import { BaseService } from './BaseService.js';
import { ApiError, ERROR_CODES } from '../utils/ErrorCodes.js';

export class ElementoService extends BaseService {
  /**
   * Busca elemento com todas relações
   */
  async findByIdWithRelations(id) {
    return this.findById(id, {
      include: [
        { association: 'componentes' },
        { association: 'conteudos' },
      ],
    });
  }

  /**
   * Busca elementos de um componente
   */
  async findByComponenteId(componenteId, pagination = {}) {
    return this.findAll({ ele_com_id: componenteId }, pagination);
  }

  /**
   * Busca elemento por tipo
   */
  async findByType(type, pagination = {}) {
    return this.findAll({ ele_tipo: type }, pagination);
  }

  /**
   * Lista tipos de elementos disponíveis
   */
  async getAvailableTypes() {
    const tipos = [
      'texto',
      'imagem',
      'botao',
      'formulario',
      'tabela',
      'lista',
      'video',
      'audio',
      'iframe',
      'custom',
    ];
    return tipos;
  }

  /**
   * Valida tipo de elemento
   */
  async validateType(type) {
    const tipos = await this.getAvailableTypes();
    return tipos.includes(type);
  }
}
