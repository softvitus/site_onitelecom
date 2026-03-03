/**
 * @module controllers/RolePermissoesController
 * @description Controller de gerenciamento de permissões por role
 */

import { RolePermissaoService } from '../services/RolePermissaoService.js';
import { AuditoriaService } from '../services/AuditoriaService.js';
import { getModels } from '../models/loader.js';

export class RolePermissoesController {
  constructor() {
    const models = getModels();
    this.service = new RolePermissaoService(models.RolePermissao);
  }

  /**
   * GET /api/role-permissoes/:tipo
   * Lista todas as permissões de um tipo de usuário (role)
   */
  async getByTipo(req, res, next) {
    try {
      const { tipo } = req.params;

      const permissoes = await this.service.findByTipo(tipo);

      return res.json({
        success: true,
        tipo,
        data: permissoes,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/role-permissoes/:tipo/permissoes/:permissaoId
   * Atribui uma permissão a um tipo de usuário (role)
   */
  async atribuirPermissao(req, res, next) {
    try {
      const { tipo, permissaoId } = req.params;

      const rolePermissao = await this.service.atribuirPermissao(
        tipo,
        permissaoId
      );

      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'atribuir',
        entidade: 'role_permissao',
        entidadeId: `${tipo}_${permissaoId}`,
        dadosAnteriores: null,
        dadosNovos: {
          tipo,
          permissaoId,
          data: new Date(),
        },
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'sucesso',
        mensagemErro: null,
      });

      return res.status(201).json({
        success: true,
        message: `Permissão atribuída ao role ${tipo}`,
        data: rolePermissao,
      });
    } catch (error) {
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'atribuir',
        entidade: 'role_permissao',
        entidadeId: `${req.params.tipo}_${req.params.permissaoId}`,
        dadosAnteriores: null,
        dadosNovos: req.params,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'erro',
        mensagemErro: error.message,
      });

      next(error);
    }
  }

  /**
   * DELETE /api/role-permissoes/:tipo/permissoes/:permissaoId
   * Remove uma permissão de um tipo de usuário (role)
   */
  async removerPermissao(req, res, next) {
    try {
      const { tipo, permissaoId } = req.params;

      const rolePermissao = await this.service.removerPermissao(
        tipo,
        permissaoId
      );

      if (!rolePermissao) {
        return res.status(404).json({
          success: false,
          error: 'Permissão não encontrada para este role',
        });
      }

      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'remover',
        entidade: 'role_permissao',
        entidadeId: `${tipo}_${permissaoId}`,
        dadosAnteriores: {
          tipo,
          permissaoId,
        },
        dadosNovos: null,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'sucesso',
        mensagemErro: null,
      });

      return res.json({
        success: true,
        message: `Permissão removida do role ${tipo}`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/role-permissoes/:tipo/permissoes
   * Substitui todas as permissões de um tipo de usuário (role)
   * Body: { permissaoIds: [id1, id2, ...] }
   */
  async replacePermissoes(req, res, next) {
    try {
      const { tipo } = req.params;
      const { permissaoIds } = req.body;

      if (!Array.isArray(permissaoIds)) {
        return res.status(400).json({
          success: false,
          error: 'permissaoIds deve ser um array',
        });
      }

      const permissoesAnteriores = await this.service.findByTipo(tipo);
      const idsAnteriores = permissoesAnteriores.map(p => p.perm_id);

      await this.service.replacePermissoes(tipo, permissaoIds);

      const permissoesNovas = await this.service.findByTipo(tipo);

      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'substituir_permissoes',
        entidade: 'role_permissao',
        entidadeId: tipo,
        dadosAnteriores: {
          tipo,
          permissaoIds: idsAnteriores,
        },
        dadosNovos: {
          tipo,
          permissaoIds,
        },
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'sucesso',
        mensagemErro: null,
      });

      return res.json({
        success: true,
        message: `Permissões atualizadas para o role ${tipo}`,
        tipo,
        data: permissoesNovas,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/role-permissoes/:tipo/tem/:permissaoNome
   * Verifica se um role tem uma permissão específica
   */
  async temPermissao(req, res, next) {
    try {
      const { tipo, permissaoNome } = req.params;

      const tem = await this.service.temPermissao(tipo, permissaoNome);

      return res.json({
        success: true,
        tipo,
        permissao: permissaoNome,
        tem,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/role-permissoes
   * Lista todas as role-permissões com paginação e filtros
   * Query params: page, limit, search
   */
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;

      // Construir filtros
      const filters = {};
      if (search) {
        const models = getModels();
        const { Op } = require('sequelize');
        filters[Op.or] = [
          { roleperm_tipo: { [Op.like]: `%${search}%` } },
        ];
      }

      // Usar o serviço para buscar com paginação
      const result = await this.service.findAll(filters, { page, limit, sort: 'roleperm_tipo,-createdAt' }, {
        include: [
          {
            association: 'permissao',
            attributes: ['perm_id', 'perm_nome', 'perm_modulo', 'perm_acao', 'perm_descricao'],
          },
        ],
      });

      return res.json({
        success: true,
        data: result.rows,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/role-permissoes/:id
   * Busca uma role-permissão por ID
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      
      const rolePermissao = await this.service.findById(id, {
        include: [
          {
            association: 'permissao',
            attributes: ['perm_id', 'perm_nome', 'perm_modulo', 'perm_acao', 'perm_descricao'],
          },
        ],
      });

      if (!rolePermissao) {
        return res.status(404).json({
          success: false,
          error: 'Role-Permissão não encontrada',
        });
      }

      return res.json({
        success: true,
        data: rolePermissao,
      });
    } catch (error) {
      if (error.code === 'NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: 'Role-Permissão não encontrada',
        });
      }
      next(error);
    }
  }

  /**
   * POST /api/role-permissoes
   * Cria uma nova role-permissão
   * Body: { roleperm_tipo, roleperm_perm_id }
   */
  async create(req, res, next) {
    try {
      const { tipo, permissaoId } = req.body;

      if (!tipo || !permissaoId) {
        return res.status(400).json({
          success: false,
          error: 'Tipo e permissaoId são obrigatórios',
        });
      }

      const rolePermissao = await this.service.atribuirPermissao(tipo, permissaoId);

      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'criar',
        entidade: 'role_permissao',
        entidadeId: rolePermissao.roleperm_id,
        dadosAnteriores: null,
        dadosNovos: {
          tipo,
          permissaoId,
        },
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'sucesso',
        mensagemErro: null,
      });

      return res.status(201).json({
        success: true,
        message: 'Role-Permissão criada com sucesso',
        data: rolePermissao,
      });
    } catch (error) {
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'criar',
        entidade: 'role_permissao',
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
   * PUT /api/role-permissoes/:id
   * Atualiza uma role-permissão existente
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { tipo, permissaoId } = req.body;

      const rolePermissao = await this.service.findById(id);

      if (!rolePermissao) {
        return res.status(404).json({
          success: false,
          error: 'Role-Permissão não encontrada',
        });
      }

      const dadosAnteriores = {
        tipo: rolePermissao.roleperm_tipo,
        permissaoId: rolePermissao.roleperm_perm_id,
      };

      // Se for mudar a permissão, remover a antiga e atribuir a nova
      if (permissaoId && permissaoId !== rolePermissao.roleperm_perm_id) {
        await this.service.removerPermissao(
          rolePermissao.roleperm_tipo,
          rolePermissao.roleperm_perm_id
        );

        const novaRolePermissao = await this.service.atribuirPermissao(
          tipo || rolePermissao.roleperm_tipo,
          permissaoId
        );

        await AuditoriaService.registrar({
          usuarioId: req.user?.id,
          acao: 'atualizar',
          entidade: 'role_permissao',
          entidadeId: id,
          dadosAnteriores,
          dadosNovos: {
            tipo: tipo || rolePermissao.roleperm_tipo,
            permissaoId,
          },
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          status: 'sucesso',
          mensagemErro: null,
        });

        return res.json({
          success: true,
          message: 'Role-Permissão atualizada com sucesso',
          data: novaRolePermissao,
        });
      }

      return res.json({
        success: true,
        message: 'Role-Permissão mantida',
        data: rolePermissao,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/role-permissoes/:id
   * Deleta uma role-permissão
   */
  async remove(req, res, next) {
    try {
      const { id } = req.params;

      const rolePermissao = await this.service.findById(id);

      if (!rolePermissao) {
        return res.status(404).json({
          success: false,
          error: 'Role-Permissão não encontrada',
        });
      }

      const dadosAnteriores = {
        tipo: rolePermissao.roleperm_tipo,
        permissaoId: rolePermissao.roleperm_perm_id,
      };

      await this.service.removerPermissao(
        rolePermissao.roleperm_tipo,
        rolePermissao.roleperm_perm_id
      );

      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'deletar',
        entidade: 'role_permissao',
        entidadeId: id,
        dadosAnteriores,
        dadosNovos: null,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'sucesso',
        mensagemErro: null,
      });

      return res.json({
        success: true,
        message: 'Role-Permissão deletada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
}
