/**
 * @module services/RolePermissaoService
 * @description Serviço de gerenciamento de mapeamento de roles para permissões
 */

import { BaseService } from './BaseService.js';
import { ApiError } from '../utils/ErrorCodes.js';
import { getModels } from '../models/loader.js';

/**
 * Serviço de gerenciamento de RolePermissoes
 * @extends BaseService
 */
export class RolePermissaoService extends BaseService {
  /**
   * Tipos de usuário válidos
   * @type {string[]}
   */
  static VALID_TIPOS = ['admin', 'gestor', 'usuario'];

  /**
   * Busca permissões de um tipo (role)
   * @param {string} tipo - Tipo do usuário
   * @returns {Promise<Array>} Lista de permissões
   */
  async findByTipo(tipo) {
    if (!RolePermissaoService.VALID_TIPOS.includes(tipo)) {
      throw new ApiError(
        'VALIDATION_ERROR',
        `Tipo deve ser um de: ${RolePermissaoService.VALID_TIPOS.join(', ')}`,
      );
    }

    return this.model.findAll({
      where: { roleperm_tipo: tipo },
      include: [
        {
          association: 'permissao',
          attributes: [
            'perm_id',
            'perm_nome',
            'perm_modulo',
            'perm_acao',
            'perm_descricao',
          ],
        },
      ],
    });
  }

  /**
   * Verifica se um tipo tem uma permissão específica
   * @param {string} tipo - Tipo do usuário
   * @param {string} permNome - Nome da permissão
   * @returns {Promise<boolean>} True se tem a permissão
   */
  async temPermissao(tipo, permNome) {
    if (!RolePermissaoService.VALID_TIPOS.includes(tipo)) {
      return false;
    }

    const rolePermissao = await this.model.findOne({
      where: { roleperm_tipo: tipo },
      include: [
        {
          association: 'permissao',
          where: { perm_nome: permNome },
          attributes: ['perm_nome'],
          required: true,
        },
      ],
    });

    return !!rolePermissao;
  }

  /**
   * Atribui uma permissão a um tipo (role)
   * @param {string} tipo - Tipo do usuário
   * @param {string} permissaoId - ID da permissão
   * @returns {Promise<Object>} RolePermissao criada
   */
  async atribuirPermissao(tipo, permissaoId) {
    if (!RolePermissaoService.VALID_TIPOS.includes(tipo)) {
      throw new ApiError(
        'VALIDATION_ERROR',
        `Tipo deve ser um de: ${RolePermissaoService.VALID_TIPOS.join(', ')}`,
      );
    }

    // Verificar se a permissão existe
    const models = getModels();
    const permissao = await models.Permissao.findByPk(permissaoId);
    if (!permissao) {
      throw new ApiError('NOT_FOUND', 'Permissão não encontrada');
    }

    // Verificar se já existe a atribuição
    const existe = await this.model.findOne({
      where: {
        roleperm_tipo: tipo,
        roleperm_perm_id: permissaoId,
      },
    });

    if (existe) {
      throw new ApiError(
        'VALIDATION_ERROR',
        'Esta permissão já está atribuída a este tipo',
      );
    }

    return this.create({
      roleperm_tipo: tipo,
      roleperm_perm_id: permissaoId,
    });
  }

  /**
   * Remove uma permissão de um tipo (role)
   * @param {string} tipo - Tipo do usuário
   * @param {string} permissaoId - ID da permissão
   * @returns {Promise<number>} Número de registros deletados
   */
  async removerPermissao(tipo, permissaoId) {
    if (!RolePermissaoService.VALID_TIPOS.includes(tipo)) {
      throw new ApiError(
        'VALIDATION_ERROR',
        `Tipo deve ser um de: ${RolePermissaoService.VALID_TIPOS.join(', ')}`,
      );
    }

    const count = await this.model.destroy({
      where: {
        roleperm_tipo: tipo,
        roleperm_perm_id: permissaoId,
      },
    });

    if (count === 0) {
      throw new ApiError('NOT_FOUND', 'Atribuição de permissão não encontrada');
    }

    return count;
  }

  /**
   * Replaces all permissions for a role type
   * @param {string} tipo - Tipo do usuário
   * @param {Array} permissaoIds - Array de IDs de permissões
   * @returns {Promise<Array>} Array de RolePermissoes criadas
   */
  async replacePermissoes(tipo, permissaoIds) {
    if (!RolePermissaoService.VALID_TIPOS.includes(tipo)) {
      throw new ApiError(
        'VALIDATION_ERROR',
        `Tipo deve ser um de: ${RolePermissaoService.VALID_TIPOS.join(', ')}`,
      );
    }

    if (!Array.isArray(permissaoIds)) {
      throw new ApiError('VALIDATION_ERROR', 'permissaoIds deve ser um array');
    }

    // Deletar todas as permissões atuais
    await this.model.destroy({
      where: { roleperm_tipo: tipo },
    });

    // Criar novas atribuições
    const models = getModels();
    const rolePermissoes = [];

    for (const permissaoId of permissaoIds) {
      const permissao = await models.Permissao.findByPk(permissaoId);
      if (!permissao) {
        throw new ApiError(
          'NOT_FOUND',
          `Permissão ${permissaoId} não encontrada`,
        );
      }

      const rp = await this.create({
        roleperm_tipo: tipo,
        roleperm_perm_id: permissaoId,
      });

      rolePermissoes.push(rp);
    }

    return rolePermissoes;
  }
}
