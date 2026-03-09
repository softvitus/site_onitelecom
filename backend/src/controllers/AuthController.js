/**
 * @module controllers/AuthController
 * @description Controller de autenticação (login, logout, tokens)
 */

import jwt from 'jsonwebtoken';
import { getModels } from '../models/loader.js';
import { UsuarioService } from '../services/UsuarioService.js';
import { AuditoriaService } from '../services/AuditoriaService.js';
import { ApiError } from '../utils/ErrorCodes.js';

export class AuthController {
  constructor() {
    const models = getModels();
    this.usuarioService = new UsuarioService(models.Usuario);
  }

  /**
   * Login - Autentica usuário e gera token JWT
   * POST /auth/login
   * Body: { email, senha }
   * Return: { success, token, usuario }
   */
  async login(req, res, next) {
    try {
      const { email, senha } = req.body;

      // Validar campos obrigatórios
      if (!email || !senha) {
        throw new ApiError(
          'VALIDATION_ERROR',
          'Email e senha são obrigatórios',
          400,
        );
      }

      // Autenticar usuário
      const usuario = await this.usuarioService.autenticar(email, senha);

      // Registrar auditoria de login bem-sucedido
      await AuditoriaService.registrar({
        usuarioId: usuario.usu_id,
        acao: 'login',
        entidade: 'auth',
        entidadeId: null,
        dadosAnteriores: null,
        dadosNovos: {
          email: usuario.usu_email,
          tipo: usuario.usu_tipo,
        },
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'sucesso',
        mensagemErro: null,
      });

      // Gerar token JWT
      const token = jwt.sign(
        {
          id: usuario.usu_id,
          email: usuario.usu_email,
          tipo: usuario.usu_tipo,
          parceiroId: usuario.usu_parceiro_id || null,
        },
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: '24h' },
      );

      // Atualizar último acesso
      await usuario.update({
        usu_ultimo_acesso: new Date(),
      });

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          token,
          usuario: usuario.toJSON(),
        },
      });
    } catch (error) {
      // Registrar auditoria de login falhado
      const email = req.body?.email || 'desconhecido';
      await AuditoriaService.registrar({
        usuarioId: null,
        acao: 'login',
        entidade: 'auth',
        entidadeId: null,
        dadosAnteriores: null,
        dadosNovos: { email },
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'erro',
        mensagemErro: error.message || 'Erro ao fazer login',
      });

      next(error);
    }
  }

  /**
   * Logout - Invalida token (nota: JWT é stateless, logic pode ser em frontend)
   * POST /auth/logout
   */
  async logout(req, res, next) {
    try {
      // Registrar auditoria de logout
      if (req.user) {
        await AuditoriaService.registrar({
          usuarioId: req.user.id,
          acao: 'logout',
          entidade: 'auth',
          entidadeId: null,
          dadosAnteriores: null,
          dadosNovos: {
            email: req.user.email,
            tipo: req.user.tipo,
          },
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          status: 'sucesso',
          mensagemErro: null,
        });
      }

      // JWT é stateless, então o logout é principalmente no frontend
      // Poderia implementar blacklist se necessário
      res.json({
        success: true,
        message: 'Logout realizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Current User - Retorna dados do usuário autenticado
   * GET /auth/me
   * Requer: token válido no header Authorization
   */
  async getCurrentUser(req, res, next) {
    try {
      const usuarioId = req.user?.id;

      if (!usuarioId) {
        throw new ApiError('UNAUTHORIZED', 'Usuário não autenticado', 401);
      }

      const usuario = await this.usuarioService.findById(usuarioId);

      res.json({
        success: true,
        data: usuario.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh Token - Gera novo token JWT
   * POST /auth/refresh
   * Requer: token válido no header Authorization
   */
  async refreshToken(req, res, next) {
    try {
      const usuarioId = req.user?.id;

      if (!usuarioId) {
        throw new ApiError('UNAUTHORIZED', 'Usuário não autenticado', 401);
      }

      const usuario = await this.usuarioService.findById(usuarioId);

      if (!usuario) {
        throw new ApiError('NOT_FOUND', 'Usuário não encontrado', 404);
      }

      // Gerar novo token
      const token = jwt.sign(
        {
          id: usuario.usu_id,
          email: usuario.usu_email,
          tipo: usuario.usu_tipo,
        },
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: '24h' },
      );

      res.json({
        success: true,
        message: 'Token renovado com sucesso',
        data: {
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify Token - Verifica se token é válido
   * POST /auth/verify
   * Body: { token }
   */
  async verifyToken(req, res, next) {
    try {
      const { token } = req.body;

      if (!token) {
        throw new ApiError('VALIDATION_ERROR', 'Token é obrigatório', 400);
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      );

      res.json({
        success: true,
        message: 'Token válido',
        data: decoded,
      });
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return next(new ApiError('INVALID_TOKEN', 'Token inválido', 401));
      }
      if (error.name === 'TokenExpiredError') {
        return next(new ApiError('TOKEN_EXPIRED', 'Token expirado', 401));
      }
      next(error);
    }
  }

  /**
   * Change Password - Altera senha do usuário autenticado
   * POST /auth/change-password
   * Body: { senhaAtual, senhaNova, senhaConfirm }
   */
  async changePassword(req, res, next) {
    try {
      const usuarioId = req.user?.id;
      const { senhaAtual, senhaNova, senhaConfirm } = req.body;

      if (!usuarioId) {
        throw new ApiError('UNAUTHORIZED', 'Usuário não autenticado', 401);
      }

      // Validar campos
      if (!senhaAtual || !senhaNova || !senhaConfirm) {
        throw new ApiError(
          'VALIDATION_ERROR',
          'Todos os campos de senha são obrigatórios',
          400,
        );
      }

      // Validar se senhas novas são iguais
      if (senhaNova !== senhaConfirm) {
        throw new ApiError(
          'VALIDATION_ERROR',
          'As senhas novas não conferem',
          400,
        );
      }

      // Validar comprimento mínimo
      if (senhaNova.length < 6) {
        throw new ApiError(
          'VALIDATION_ERROR',
          'A nova senha deve ter pelo menos 6 caracteres',
          400,
        );
      }

      // Alterar senha
      await this.usuarioService.alterarSenha(usuarioId, senhaAtual, senhaNova);

      // Registrar auditoria de mudança de senha
      await AuditoriaService.registrar({
        usuarioId,
        acao: 'alterar_senha',
        entidade: 'auth',
        entidadeId: null,
        dadosAnteriores: null,
        dadosNovos: {
          email: req.user.email,
          tipo: req.user.tipo,
        },
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'sucesso',
        mensagemErro: null,
      });

      res.json({
        success: true,
        message: 'Senha alterada com sucesso',
      });
    } catch (error) {
      // Registrar auditoria de falha ao alterar senha
      const usuarioId = req.user?.id;
      if (usuarioId) {
        await AuditoriaService.registrar({
          usuarioId,
          acao: 'alterar_senha',
          entidade: 'auth',
          entidadeId: null,
          dadosAnteriores: null,
          dadosNovos: {
            email: req.user.email,
            tipo: req.user.tipo,
          },
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          status: 'erro',
          mensagemErro: error.message || 'Erro ao alterar senha',
        });
      }
      next(error);
    }
  }

  /**
   * Get My Permissions - Retorna todas as permissões do usuário autenticado
   * GET /auth/me/permissoes
   * Requer: token válido no header Authorization
   */
  async getMyPermissions(req, res, next) {
    try {
      const usuarioId = req.user?.id;

      if (!usuarioId) {
        throw new ApiError('UNAUTHORIZED', 'Usuário não autenticado', 401);
      }

      const perms = await this.usuarioService.getPermissoes(usuarioId);

      res.json({
        success: true,
        data: perms,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;

// Instância do controller
export const authController = new AuthController();
