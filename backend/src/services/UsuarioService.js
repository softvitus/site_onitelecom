/**
 * @module services/UsuarioService
 * @description Serviço de gerenciamento de usuários e autenticação
 */

import { BaseService } from './BaseService.js';
import { ApiError } from '../utils/ErrorCodes.js';
import bcrypt from 'bcryptjs';

/**
 * Serviço de gerenciamento de Usuários
 * @extends BaseService
 */
export class UsuarioService extends BaseService {
  /**
   * Tipos de usuário válidos
   * @type {string[]}
   */
  static VALID_TIPOS = ['admin', 'gestor', 'usuario'];

  /**
   * Status de usuário válidos
   * @type {string[]}
   */
  static VALID_STATUS = ['ativo', 'inativo', 'bloqueado'];

  /**
   * Busca usuário com todas as relações
   * @param {string} id - ID do usuário
   * @returns {Promise<Object>} Usuário com logs e sessões
   */
  async findByIdWithRelations(id) {
    return this.findById(id, {
      include: [
        { association: 'logs', limit: 10 },
        { association: 'sessoes', limit: 5 },
      ],
    });
  }

  /**
   * Busca usuário por email
   * @param {string} email - Email do usuário
   * @returns {Promise<Object>} Usuário encontrado
   * @throws {ApiError} NOT_FOUND se não existir
   */
  async findByEmail(email) {
    const user = await this.model.findOne({
      where: { usu_email: email },
    });

    if (!user) {
      throw new ApiError(
        'NOT_FOUND',
        'Usuário não encontrado',
        404
      );
    }

    return user;
  }

  /**
   * Busca usuários ativos
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de usuários ativos
   */
  async findActive(pagination = {}) {
    return this.findAll({ usu_status: 'ativo' }, pagination);
  }

  /**
   * Busca usuários por tipo (role)
   * @param {string} tipo - Tipo do usuário
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de usuários
   */
  async findByType(tipo, pagination = {}) {
    return this.findAll({ usu_tipo: tipo }, pagination);
  }

  /**
   * Busca usuários de um parceiro
   * @param {string} parceiroId - ID do parceiro
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de usuários
   */
  async findByParceiro(parceiroId, pagination = {}) {
    return this.findAll({ usu_parceiro_id: parceiroId }, pagination);
  }

  /**
   * Busca usuários bloqueados
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de usuários bloqueados
   */
  async findBloqueados(pagination = {}) {
    return this.findAll({ usu_status: 'bloqueado' }, pagination);
  }

  /**
   * Autentica usuário (login)
   * @param {string} email - Email do usuário
   * @param {string} senha - Senha do usuário
   * @returns {Promise<Object>} Usuário autenticado
   * @throws {ApiError} INVALID_CREDENTIALS se credenciais inválidas
   * @throws {ApiError} ACCOUNT_BLOCKED se conta bloqueada
   * @throws {ApiError} ACCOUNT_INACTIVE se conta inativa
   */
  async autenticar(email, senha) {
    // Buscar usuário
    let usuario;
    try {
      usuario = await this.findByEmail(email);
    } catch (error) {
      // Não revelar se email existe ou não (segurança)
      throw new ApiError(
        'INVALID_CREDENTIALS',
        'Email ou senha inválidos',
        401
      );
    }

    // Verificar status
    if (usuario.usu_status === 'bloqueado') {
      throw new ApiError(
        'ACCOUNT_BLOCKED',
        'Conta bloqueada. Contate o administrador.',
        403
      );
    }

    if (usuario.usu_status !== 'ativo') {
      throw new ApiError(
        'ACCOUNT_INACTIVE',
        'Conta inativa',
        403
      );
    }

    // Verificar tentativas de login
    if (usuario.usu_tentativas_login >= 5) {
      await usuario.update({ usu_status: 'bloqueado' });
      throw new ApiError(
        'ACCOUNT_BLOCKED',
        'Muitas tentativas de login. Conta bloqueada.',
        403
      );
    }

    // Comparar senha
    const senhaValida = await bcrypt.compare(senha, usuario.usu_senha);

    if (!senhaValida) {
      await usuario.incrementarTentativas();
      throw new ApiError(
        'INVALID_CREDENTIALS',
        'Email ou senha inválidos',
        401
      );
    }

    // Login bem-sucedido: resetar tentativas
    await usuario.resetarTentativas();

    return usuario;
  }

  /**
   * Criar novo usuário
   * @param {Object} data - Dados do usuário
   * @returns {Promise<Object>} Usuário criado
   * @throws {ApiError} VALIDATION_ERROR se dados inválidos
   * @throws {ApiError} DUPLICATE_ENTRY se email já existe
   */
  async criar(data) {
    // Validar campos obrigatórios
    this.validate(data, ['usu_email', 'usu_nome', 'usu_senha']);

    // Validar tipo
    if (data.usu_tipo) {
      this.validateTipo(data.usu_tipo);
    }

    // Validar que gestor e usuario devem ter parceiro
    if (['gestor', 'usuario'].includes(data.usu_tipo) && !data.usu_parceiro_id) {
      throw new ApiError(
        'VALIDATION_ERROR',
        'Gestores e usuários devem estar vinculados a um parceiro',
        400
      );
    }

    // Verificar se email já existe
    const existe = await this.model.findOne({
      where: { usu_email: data.usu_email },
    });

    if (existe) {
      throw new ApiError(
        'DUPLICATE_ENTRY',
        'Este email já está cadastrado',
        409
      );
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(data.usu_senha, 10);

    return this.create({
      ...data,
      usu_senha: senhaHash,
    });
  }

  /**
   * Atualizar usuário
   * @param {string} id - ID do usuário
   * @param {Object} data - Dados a atualizar
   * @returns {Promise<Object>} Usuário atualizado
   * @throws {ApiError} NOT_FOUND se não existir
   * @throws {ApiError} DUPLICATE_ENTRY se email já existe
   */
  async atualizar(id, data) {
    const usuario = await this.findById(id);

    if (!usuario) {
      throw new ApiError('NOT_FOUND', 'Usuário não encontrado', 404);
    }

    // Se alterando email, verificar duplicata
    if (data.usu_email && data.usu_email !== usuario.usu_email) {
      const existe = await this.model.findOne({
        where: { usu_email: data.usu_email },
      });

      if (existe) {
        throw new ApiError(
          'DUPLICATE_ENTRY',
          'Este email já está cadastrado',
          409
        );
      }
    }

    return usuario.update(data);
  }

  /**
   * Alterar senha
   * @param {string} id - ID do usuário
   * @param {string} senhaAtual - Senha atual
   * @param {string} senhaNova - Nova senha
   * @returns {Promise<Object>} Usuário atualizado
   * @throws {ApiError} NOT_FOUND se não existir
   * @throws {ApiError} INVALID_PASSWORD se senha atual incorreta
   */
  async alterarSenha(id, senhaAtual, senhaNova) {
    const usuario = await this.findById(id);

    if (!usuario) {
      throw new ApiError('NOT_FOUND', 'Usuário não encontrado', 404);
    }

    // Verificar senha atual
    const senhaValida = await bcrypt.compare(senhaAtual, usuario.usu_senha);

    if (!senhaValida) {
      throw new ApiError(
        'INVALID_PASSWORD',
        'Senha atual incorreta',
        401
      );
    }

    // Hash da nova senha
    const senhaHash = await bcrypt.hash(senhaNova, 10);

    return usuario.update({ usu_senha: senhaHash });
  }

  /**
   * Bloquear usuário
   * @param {string} id - ID do usuário
   * @returns {Promise<Object>} Usuário bloqueado
   * @throws {ApiError} NOT_FOUND se não existir
   */
  async bloquear(id) {
    const usuario = await this.findById(id);

    if (!usuario) {
      throw new ApiError('NOT_FOUND', 'Usuário não encontrado', 404);
    }

    return usuario.update({ usu_status: 'bloqueado' });
  }

  /**
   * Desbloquear usuário
   * @param {string} id - ID do usuário
   * @returns {Promise<Object>} Usuário desbloqueado
   * @throws {ApiError} NOT_FOUND se não existir
   */
  async desbloquear(id) {
    const usuario = await this.findById(id);

    if (!usuario) {
      throw new ApiError('NOT_FOUND', 'Usuário não encontrado', 404);
    }

    return usuario.update({
      usu_status: 'ativo',
      usu_tentativas_login: 0,
    });
  }

  /**
   * Retorna tipos de usuário válidos
   * @returns {string[]} Lista de tipos
   */
  getValidTipos() {
    return UsuarioService.VALID_TIPOS;
  }

  /**
   * Retorna status de usuário válidos
   * @returns {string[]} Lista de status
   */
  getValidStatus() {
    return UsuarioService.VALID_STATUS;
  }

  /**
   * Valida tipo de usuário
   * @param {string} tipo - Tipo a validar
   * @returns {boolean} True se válido
   * @throws {ApiError} INVALID_INPUT se tipo inválido
   */
  validateTipo(tipo) {
    if (!UsuarioService.VALID_TIPOS.includes(tipo)) {
      throw new ApiError(
        'INVALID_INPUT',
        `Tipo inválido. Tipos válidos: ${this.getValidTipos().join(', ')}`,
        400
      );
    }
    return true;
  }

  /**
   * Valida status de usuário
   * @param {string} status - Status a validar
   * @returns {boolean} True se válido
   * @throws {ApiError} INVALID_INPUT se status inválido
   */
  validateStatus(status) {
    if (!UsuarioService.VALID_STATUS.includes(status)) {
      throw new ApiError(
        'INVALID_INPUT',
        `Status inválido. Status válidos: ${this.getValidStatus().join(', ')}`,
        400
      );
    }
    return true;
  }

  /**
   * Verifica se usuário tem permissão
   * @param {string} usuarioId - ID do usuário
   * @param {string} permissaoNome - Nome da permissão
   * @returns {Promise<boolean>} True se tem permissão
   * @throws {ApiError} NOT_FOUND se usuário não existir
   */
  async temPermissao(usuarioId, permissaoNome) {
    const usuario = await this.findById(usuarioId);

    if (!usuario) {
      throw new ApiError('NOT_FOUND', 'Usuário não encontrado', 404);
    }

    // Admin sempre tem todas as permissões
    if (usuario.usu_tipo === 'admin') {
      return true;
    }

    // Buscar permissões do role
    const { RolePermissao } = this.model.sequelize.models;
    const temPerm = await RolePermissao.temPermissao(usuario.usu_tipo, permissaoNome);

    return temPerm;
  }

  /**
   * Obtém permissões do usuário
   * @param {string} usuarioId - ID do usuário
   * @returns {Promise<string[]>} Lista de nomes de permissões
   * @throws {ApiError} NOT_FOUND se usuário não existir
   */
  async getPermissoes(usuarioId) {
    const usuario = await this.findById(usuarioId);

    if (!usuario) {
      throw new ApiError('NOT_FOUND', 'Usuário não encontrado', 404);
    }

    // Buscar permissões do role
    const { RolePermissao } = this.model.sequelize.models;
    const rolePerms = await RolePermissao.findByTipo(usuario.usu_tipo);

    // Retornar apenas os nomes das permissões (array de strings)
    return rolePerms.map(rp => rp.permissao.perm_nome);
  }
}

export default UsuarioService;
