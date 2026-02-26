/**
 * Usuario Service
 * Gerencia usuários e autenticação
 */

import { BaseService } from './BaseService.js';
import { ApiError, ERROR_CODES } from '../utils/ErrorCodes.js';
import bcrypt from 'bcryptjs';

export class UsuarioService extends BaseService {
  /**
   * Busca usuário com todas as relações
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
   */
  async findActive(pagination = {}) {
    return this.findAll({ usu_status: 'ativo' }, pagination);
  }

  /**
   * Busca usuários por tipo (role)
   */
  async findByType(tipo, pagination = {}) {
    return this.findAll({ usu_tipo: tipo }, pagination);
  }

  /**
   * Busca usuários de um parceiro específico
   */
  async findByParceiro(parceiroId, pagination = {}) {
    return this.findAll({ usu_parceiro_id: parceiroId }, pagination);
  }

  /**
   * Busca usuários bloqueados
   */
  async findBloqueados(pagination = {}) {
    return this.findAll({ usu_status: 'bloqueado' }, pagination);
  }

  /**
   * Autentica usuário (login)
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
   * Validar tipos de usuário
   */
  getValidTipos() {
    return ['admin', 'gestor', 'usuario'];
  }

  /**
   * Validar status de usuário
   */
  getValidStatus() {
    return ['ativo', 'inativo', 'bloqueado'];
  }

  /**
   * Validar tipo
   */
  validateTipo(tipo) {
    if (!this.getValidTipos().includes(tipo)) {
      throw new ApiError(
        'INVALID_INPUT',
        `Tipo inválido. Tipos válidos: ${this.getValidTipos().join(', ')}`,
        400
      );
    }
    return true;
  }

  /**
   * Validar status
   */
  validateStatus(status) {
    if (!this.getValidStatus().includes(status)) {
      throw new ApiError(
        'INVALID_INPUT',
        `Status inválido. Status válidos: ${this.getValidStatus().join(', ')}`,
        400
      );
    }
    return true;
  }

  /**
   * Verificar se usuário tem uma permissão específica
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
   * Obter todas as permissões de um usuário
   */
  async getPermissoes(usuarioId) {
    const usuario = await this.findById(usuarioId);

    if (!usuario) {
      throw new ApiError('NOT_FOUND', 'Usuário não encontrado', 404);
    }

    // Buscar permissões do role
    const { RolePermissao } = this.model.sequelize.models;
    const rolePerms = await RolePermissao.findByTipo(usuario.usu_tipo);

    return rolePerms.map(rp => ({
      id: rp.permissao.perm_id,
      nome: rp.permissao.perm_nome,
      descricao: rp.permissao.perm_descricao,
      modulo: rp.permissao.perm_modulo,
      acao: rp.permissao.perm_acao,
    }));
  }
}

export default UsuarioService;
