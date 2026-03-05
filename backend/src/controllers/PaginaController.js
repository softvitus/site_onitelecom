/**
 * @module controllers/PaginaController
 * @description Controller de gerenciamento de páginas
 */

import { PaginaService } from '../services/index.js';
import { AuditoriaService } from '../services/AuditoriaService.js';
import { getModels } from '../models/loader.js';

/**
 * Controller de Paginas
 */
export class PaginaController {
  constructor() {
    const models = getModels();
    this.service = new PaginaService(models.Pagina);
  }

  /**
   * GET /api/paginas
   * Lista páginas com paginação
   * Filtra por parceiro se usuário não for admin
   */
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      
      // Construir filtros
      const filtros = {};
      
      // Se não é admin e tem parceiroId, filtrar por parceiro
      if (req.user?.tipo !== 'admin' && req.user?.parceiroId) {
        filtros.pag_par_id = req.user.parceiroId;
      }
      
      const result = await this.service.findAll(
        filtros,
        { page: parseInt(page), limit: parseInt(limit) },
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
   * GET /api/paginas/:id
   * Busca página por ID com todas as relações
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const item = await this.service.findById(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Página não encontrada',
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
   * POST /api/paginas
   * Cria nova página
   */
  async create(req, res, next) {
    try {
      const item = await this.service.create(req.body);

      // Registrar auditoria de criação
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'criar',
        entidade: 'pagina',
        entidadeId: item.pag_id,
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
        entidade: 'pagina',
        entidadeId: null,
        dadosAnteriores: null,
        dadosNovos: req.body,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'erro',
        mensagemErro: error.message || 'Erro ao criar página',
      });
      next(error);
    }
  }

  /**
   * PUT /api/paginas/:id
   * Atualiza página
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const itemAnterior = await this.service.findById(id);
      const item = await this.service.update(id, req.body);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Página não encontrada',
        });
      }

      // Registrar auditoria de atualização
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'atualizar',
        entidade: 'pagina',
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
        entidade: 'pagina',
        entidadeId: id,
        dadosAnteriores: null,
        dadosNovos: req.body,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'erro',
        mensagemErro: error.message || 'Erro ao atualizar página',
      });
      next(error);
    }
  }

  /**
   * DELETE /api/paginas/:id
   * Deleta página
   */
  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const itemAnterior = await this.service.findById(id);
      const success = await this.service.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Página não encontrada',
        });
      }

      // Registrar auditoria de deleção
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'deletar',
        entidade: 'pagina',
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
        entidade: 'pagina',
        entidadeId: id,
        dadosAnteriores: null,
        dadosNovos: null,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'erro',
        mensagemErro: error.message || 'Erro ao deletar página',
      });
      next(error);
    }
  }
}

export default PaginaController;

// Instância do controller
export const paginaController = new PaginaController();

// Exporta métodos para compatibilidade com versão anterior
export const getAll = (req, res, next) => paginaController.getAll(req, res, next);
export const getById = (req, res, next) => paginaController.getById(req, res, next);
export const create = (req, res, next) => paginaController.create(req, res, next);
export const update = (req, res, next) => paginaController.update(req, res, next);
export const remove = (req, res, next) => paginaController.remove(req, res, next);
