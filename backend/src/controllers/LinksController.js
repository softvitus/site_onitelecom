/**
 * @module controllers/LinksController
 * @description Controller de gerenciamento de links
 */

import { LinksService } from '../services/index.js';
import { AuditoriaService } from '../services/AuditoriaService.js';
import { getModels } from '../models/loader.js';

/**
 * Controller de Links
 */
export class LinksController {
  constructor() {
    const models = getModels();
    this.service = new LinksService(models.Links);
  }

  /**
   * GET /api/links
   * Lista links com paginação
   * Filtra por parceiro se usuário não for admin
   */
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      
      // Construir filtros
      const filtros = {};
      
      // Se não é admin e tem parceiroId, filtrar por parceiro
      // Links estão vinculados a temas, que têm relação com parceiro
      if (req.user?.tipo !== 'admin' && req.user?.parceiroId) {
        filtros.parceiroId = req.user.parceiroId;
      }
      
      const result = await this.service.findAll(
        filtros,
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
   * GET /api/links/:id
   * Busca link por ID com todas as relações
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const item = await this.service.findById(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Link não encontrado',
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
   * POST /api/links
   * Cria novo link
   */
  async create(req, res, next) {
    try {
      const item = await this.service.create(req.body);

      // Registrar auditoria de criação
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'criar',
        entidade: 'links',
        entidadeId: item.lin_id,
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
      // Registrar auditoria de erro na criação
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'criar',
        entidade: 'links',
        entidadeId: null,
        dadosAnteriores: null,
        dadosNovos: req.body,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'erro',
        mensagemErro: error.message || 'Erro ao criar link',
      });
      next(error);
    }
  }

  /**
   * PUT /api/links/:id
   * Atualiza link
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const itemAnterior = await this.service.findById(id);
      const item = await this.service.update(id, req.body);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Link não encontrado',
        });
      }

      // Registrar auditoria de atualização
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'atualizar',
        entidade: 'links',
        entidadeId: id,
        dadosAnteriores: itemAnterior ? itemAnterior.toJSON() : null,
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
      // Registrar auditoria de erro na atualização
      const { id } = req.params;
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'atualizar',
        entidade: 'links',
        entidadeId: id,
        dadosAnteriores: null,
        dadosNovos: req.body,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'erro',
        mensagemErro: error.message || 'Erro ao atualizar link',
      });
      next(error);
    }
  }

  /**
   * DELETE /api/links/:id
   * Deleta link
   */
  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const itemAnterior = await this.service.findById(id);
      const success = await this.service.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Link não encontrado',
        });
      }

      // Registrar auditoria de deleção
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'deletar',
        entidade: 'links',
        entidadeId: id,
        dadosAnteriores: itemAnterior ? itemAnterior.toJSON() : null,
        dadosNovos: null,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'sucesso',
        mensagemErro: null,
      });

      return res.status(204).end();
    } catch (error) {
      // Registrar auditoria de erro na deleção
      const { id } = req.params;
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'deletar',
        entidade: 'links',
        entidadeId: id,
        dadosAnteriores: null,
        dadosNovos: null,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'erro',
        mensagemErro: error.message || 'Erro ao deletar link',
      });
      next(error);
    }
  }
}

export default LinksController;

// Instância do controller
export const linksController = new LinksController();

// Exporta métodos para compatibilidade com versão anterior
export const getAll = (req, res, next) => linksController.getAll(req, res, next);
export const getById = (req, res, next) => linksController.getById(req, res, next);
export const create = (req, res, next) => linksController.create(req, res, next);
export const update = (req, res, next) => linksController.update(req, res, next);
export const remove = (req, res, next) => linksController.remove(req, res, next);
