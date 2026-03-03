/**
 * @module controllers/PermissoesController
 * @description Controller de gerenciamento de permissões
 */

import { PermissaoService } from '../services/PermissaoService.js';
import { AuditoriaService } from '../services/AuditoriaService.js';
import { getModels } from '../models/loader.js';

export class PermissoesController {
  constructor() {
    const models = getModels();
    this.service = new PermissaoService(models.Permissao);
  }

  /**
   * GET /api/permissoes
   * Lista todas as permissões com paginação
   */
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 50 } = req.query;
      
      const result = await this.service.findAll(
        {},
        { page: parseInt(page), limit: parseInt(limit) }
      );

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
   * GET /api/permissoes/:id
   * Busca permissão por ID
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const item = await this.service.findById(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Permissão não encontrada',
        });
      }

      return res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/permissoes
   * Cria nova permissão
   */
  async create(req, res, next) {
    try {
      // Gerar perm_nome automaticamente: modulo_acao
      const { perm_modulo, perm_acao, perm_descricao } = req.body;

      if (!perm_modulo || !perm_acao) {
        if (process.env.DEBUG_PERMISSOES === 'true') {
          console.error('[PermissoesController.create] ERRO 400 - perm_modulo ou perm_acao vazios/indefinidos');
        }
        return res.status(400).json({
          success: false,
          error: 'perm_modulo e perm_acao são obrigatórios',
        });
      }

      const perm_nome = `${perm_modulo}_${perm_acao}`;

      const item = await this.service.createPayload({
        perm_nome,
        perm_modulo,
        perm_acao,
        perm_descricao: perm_descricao || '',
      });

      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'criar',
        entidade: 'permissao',
        entidadeId: item.perm_id,
        dadosAnteriores: null,
        dadosNovos: item.toJSON(),
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'sucesso',
        mensagemErro: null,
      });

      return res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error) {
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'criar',
        entidade: 'permissao',
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
   * PUT /api/permissoes/:id
   * Atualiza permissão
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const itemAnterior = await this.service.findById(id);

      if (!itemAnterior) {
        return res.status(404).json({
          success: false,
          error: 'Permissão não encontrada',
        });
      }

      const item = await this.service.updatePayload(id, req.body);

      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'atualizar',
        entidade: 'permissao',
        entidadeId: id,
        dadosAnteriores: itemAnterior.toJSON(),
        dadosNovos: item.toJSON(),
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'sucesso',
        mensagemErro: null,
      });

      return res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/permissoes/:id
   * Deleta permissão
   */
  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const item = await this.service.findById(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Permissão não encontrada',
        });
      }

      await this.service.delete(id);

      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'deletar',
        entidade: 'permissao',
        entidadeId: id,
        dadosAnteriores: item.toJSON(),
        dadosNovos: null,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'sucesso',
        mensagemErro: null,
      });

      return res.json({
        success: true,
        message: 'Permissão deletada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/permissoes/modulo/:modulo
   * Lista permissões por módulo
   */
  async getByModulo(req, res, next) {
    try {
      const { modulo } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const result = await this.service.findByModulo(
        modulo,
        { page: parseInt(page), limit: parseInt(limit) }
      );

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
   * GET /api/permissoes/acao/:acao
   * Lista permissões por ação
   */
  async getByAcao(req, res, next) {
    try {
      const { acao } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const result = await this.service.findByAcao(
        acao,
        { page: parseInt(page), limit: parseInt(limit) }
      );

      return res.json({
        success: true,
        data: result.rows,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}
