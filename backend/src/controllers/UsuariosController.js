/**
 * @module controllers/UsuariosController
 * @description Controller de gerenciamento de usuários
 */

import { UsuarioService } from '../services/index.js';
import { AuditoriaService } from '../services/AuditoriaService.js';
import { getModels } from '../models/loader.js';
import bcrypt from 'bcryptjs';

export class UsuariosController {
  constructor() {
    const models = getModels();
    this.service = new UsuarioService(models.Usuario);
  }

  /**
   * GET /api/usuarios
   * Lista todos os usuários com paginação
   */
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      
      const result = await this.service.findAll(
        {},
        { page: parseInt(page), limit: parseInt(limit) },
      );

      // Remover senhas da resposta
      const dados = result.rows.map(u => {
        const user = u.toJSON();
        delete user.usu_senha;
        return user;
      });

      return res.json({
        success: true,
        data: dados,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/usuarios/:id
   * Busca usuário por ID
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const item = await this.service.findById(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado',
        });
      }

      const user = item.toJSON();
      delete user.usu_senha;

      return res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/usuarios
   * Cria novo usuário
   */
  async create(req, res, next) {
    try {
      const { usu_email, usu_nome, usu_senha, usu_tipo, usu_status, usu_telefone, usu_parceiro_id } = req.body;

      if (!usu_email || !usu_nome || !usu_senha) {
        return res.status(400).json({
          success: false,
          error: 'Email, nome e senha são obrigatórios',
        });
      }

      // Hash da senha
      const senhaHash = await bcrypt.hash(usu_senha, 10);

      const item = await this.service.create({
        usu_email,
        usu_nome,
        usu_senha: senhaHash,
        usu_tipo: usu_tipo || 'usuario',
        usu_status: usu_status || 'ativo',
        usu_telefone,
        usu_parceiro_id,
      });

      // Registrar auditoria
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'criar',
        entidade: 'usuario',
        entidadeId: item.usu_id,
        dadosAnteriores: null,
        dadosNovos: {
          usu_email: item.usu_email,
          usu_nome: item.usu_nome,
          usu_tipo: item.usu_tipo,
          usu_status: item.usu_status,
        },
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'sucesso',
        mensagemErro: null,
      });

      const user = item.toJSON();
      delete user.usu_senha;

      return res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          error: 'Email já cadastrado',
        });
      }

      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'criar',
        entidade: 'usuario',
        entidadeId: null,
        dadosAnteriores: null,
        dadosNovos: req.body,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'erro',
        mensagemErro: error.message,
      });

      next(error);
    }
  }

  /**
   * PUT /api/usuarios/:id
   * Atualiza usuário
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const usuarioAnterior = await this.service.findById(id);

      if (!usuarioAnterior) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado',
        });
      }

      const dataAtualizar = { ...req.body };

      // Se enviar senha, fazer hash
      if (dataAtualizar.usu_senha) {
        dataAtualizar.usu_senha = await bcrypt.hash(dataAtualizar.usu_senha, 10);
      } else {
        delete dataAtualizar.usu_senha;
      }

      const item = await this.service.update(id, dataAtualizar);

      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'atualizar',
        entidade: 'usuario',
        entidadeId: id,
        dadosAnteriores: {
          usu_email: usuarioAnterior.usu_email,
          usu_nome: usuarioAnterior.usu_nome,
          usu_tipo: usuarioAnterior.usu_tipo,
          usu_status: usuarioAnterior.usu_status,
        },
        dadosNovos: {
          usu_email: item.usu_email,
          usu_nome: item.usu_nome,
          usu_tipo: item.usu_tipo,
          usu_status: item.usu_status,
        },
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'sucesso',
        mensagemErro: null,
      });

      const user = item.toJSON();
      delete user.usu_senha;

      return res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/usuarios/:id
   * Deleta usuário
   */
  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const item = await this.service.findById(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado',
        });
      }

      await this.service.delete(id);

      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'deletar',
        entidade: 'usuario',
        entidadeId: id,
        dadosAnteriores: {
          usu_email: item.usu_email,
          usu_nome: item.usu_nome,
        },
        dadosNovos: null,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'sucesso',
        mensagemErro: null,
      });

      return res.json({
        success: true,
        message: 'Usuário deletado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/usuarios/tipo/:tipo
   * Lista usuários por tipo
   */
  async getByType(req, res, next) {
    try {
      const { tipo } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await this.service.findByType(
        tipo,
        { page: parseInt(page), limit: parseInt(limit) },
      );

      const dados = result.rows.map(u => {
        const user = u.toJSON();
        delete user.usu_senha;
        return user;
      });

      return res.json({
        success: true,
        data: dados,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/usuarios/:id/status
   * Atualiza status do usuário
   */
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { usu_status } = req.body;

      if (!['ativo', 'inativo', 'bloqueado'].includes(usu_status)) {
        return res.status(400).json({
          success: false,
          error: 'Status inválido. Deve ser: ativo, inativo ou bloqueado',
        });
      }

      const item = await this.service.update(id, { usu_status });

      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'atualizar',
        entidade: 'usuario',
        entidadeId: id,
        dadosAnteriores: { usu_status: item.dataValues.usu_status },
        dadosNovos: { usu_status },
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'sucesso',
        mensagemErro: null,
      });

      const user = item.toJSON();
      delete user.usu_senha;

      return res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}
