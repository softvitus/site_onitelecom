/**
 * @module services/PermissaoService
 * @description Serviço de gerenciamento de permissões
 */

import { BaseService } from './BaseService.js';
import { ApiError } from '../utils/ErrorCodes.js';

/**
 * Serviço de gerenciamento de Permissões
 * @extends BaseService
 */
export class PermissaoService extends BaseService {
  /**
   * Módulos válidos
   * @type {string[]}
   */
  static VALID_MODULOS = [
    'tema', 'temas',
    'pagina', 'paginas',
    'componente', 'componentes',
    'elemento', 'elementos',
    'usuario', 'usuarios',
    'parceiro', 'parceiros',
    'relatorios',
    'auditoria',
    'cores',
    'imagens',
    'links',
    'textos',
    'conteudo', 'conteudos',
    'features',
    'config_tema',
    'role_permissoes',
    'permissoes',
  ];

  /**
   * Ações válidas
   * @type {string[]}
   */
  static VALID_ACOES = ['criar', 'listar', 'editar', 'deletar', 'visualizar', 'exportar', 'estatisticas', 'filtrar', 'leituradados'];

  /**
   * Busca permissão por nome
   * @param {string} nome - Nome da permissão
   * @returns {Promise<Object>} Permissão encontrada
   * @throws {ApiError} NOT_FOUND se não existir
   */
  async findByNome(nome) {
    const permissao = await this.model.findOne({
      where: { perm_nome: nome },
    });

    if (!permissao) {
      throw new ApiError(
        'NOT_FOUND',
        'Permissão não encontrada',
        404,
      );
    }

    return permissao;
  }

  /**
   * Busca permissões por módulo
   * @param {string} modulo - Módulo das permissões
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de permissões
   */
  async findByModulo(modulo, pagination = {}) {
    return this.findAll({ perm_modulo: modulo }, pagination);
  }

  /**
   * Busca permissões por ação
   * @param {string} acao - Ação das permissões
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de permissões
   */
  async findByAcao(acao, pagination = {}) {
    return this.findAll({ perm_acao: acao }, pagination);
  }

  /**
   * Busca permissões por módulo e ação
   * @param {string} modulo - Módulo
   * @param {string} acao - Ação
   * @returns {Promise<Object>} Permissão encontrada
   */
  async findByModuloAndAcao(modulo, acao) {
    const permissao = await this.model.findOne({
      where: {
        perm_modulo: modulo,
        perm_acao: acao,
      },
    });

    if (!permissao) {
      throw new ApiError(
        'NOT_FOUND',
        `Permissão não encontrada para ${modulo}/${acao}`,
        404,
      );
    }

    return permissao;
  }

  /**
   * Valida dados da permissão
   * @param {Object} data - Dados a validar
   * @throws {ApiError} VALIDATION_ERROR se inválido
   */
  validatePayload(data) {
    const { perm_nome, perm_modulo, perm_acao } = data;

    if (!perm_nome || typeof perm_nome !== 'string') {
      throw new ApiError('VALIDATION_ERROR', 'perm_nome é obrigatório e deve ser string');
    }

    if (!perm_modulo || !PermissaoService.VALID_MODULOS.includes(perm_modulo)) {
      throw new ApiError('VALIDATION_ERROR', `perm_modulo deve ser um de: ${PermissaoService.VALID_MODULOS.join(', ')}`);
    }

    if (!perm_acao || !PermissaoService.VALID_ACOES.includes(perm_acao)) {
      throw new ApiError('VALIDATION_ERROR', `perm_acao deve ser um de: ${PermissaoService.VALID_ACOES.join(', ')}`);
    }
  }

  /**
   * Cria nova permissão com validação
   * @param {Object} data - Dados da permissão
   * @returns {Promise<Object>} Permissão criada
   */
  async createPayload(data) {
    console.log('[PermissaoService.createPayload] Iniciando com data:', data);
    this.validatePayload(data);
    console.log('[PermissaoService.createPayload] Validação passou, chamando create');
    return this.create(data);
  }

  /**
   * Atualiza permissão com validação
   * @param {string} id - ID da permissão
   * @param {Object} data - Dados para atualizar
   * @returns {Promise<Object>} Permissão atualizada
   */
  async updatePayload(id, data) {
    if (data.perm_modulo || data.perm_acao) {
      const payload = {
        ...await this.findById(id),
        ...data,
      };
      this.validatePayload(payload);
    }
    return this.update(id, data);
  }
}
