/**
 * @module controllers/PagComRelController
 * @description Controller de gerenciamento de relações página-componente
 */

import { PagComRelService } from '../services/index.js';
import { AuditoriaService } from '../services/AuditoriaService.js';
import { getModels } from '../models/loader.js';

/**
 * Controller de Relações Página-Componente
 */
export class PagComRelController {
  constructor() {
    const models = getModels();
    this.service = new PagComRelService(models.PagComRel);
  }

  /**
   * GET /api/pag-com-rel
   * Lista todas as relações página-componente com paginação
   */
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, pcr_pag_id, pcr_com_id } = req.query;

      const filters = {};
      if (pcr_pag_id) filters.pcr_pag_id = pcr_pag_id;
      if (pcr_com_id) filters.pcr_com_id = pcr_com_id;

      const result = await this.service.findAll(
        filters,
        { page: parseInt(page), limit: parseInt(limit), sort: 'pcr_ordem' },
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
   * GET /api/pag-com-rel/:id
   * Busca relação página-componente por ID
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const item = await this.service.findById(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Relação Página-Componente não encontrada',
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
   * POST /api/pag-com-rel
   * Cria nova relação página-componente
   */
  async create(req, res, next) {
    try {
      const item = await this.service.create(req.body);

      // Registrar auditoria de criação
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'criar',
        entidade: 'pag_com_rel',
        entidadeId: item.pcr_id,
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
        entidade: 'pag_com_rel',
        entidadeId: null,
        dadosAnteriores: null,
        dadosNovos: req.body,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'erro',
        mensagemErro: error.message || 'Erro ao criar relação',
      });
      next(error);
    }
  }

  /**
   * PUT /api/pag-com-rel/:id
   * Atualiza relação página-componente
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const itemAnterior = await this.service.findById(id);
      const item = await this.service.update(id, req.body);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Relação Página-Componente não encontrada',
        });
      }

      // Registrar auditoria de atualização
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'atualizar',
        entidade: 'pag_com_rel',
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
        entidade: 'pag_com_rel',
        entidadeId: id,
        dadosAnteriores: null,
        dadosNovos: req.body,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'erro',
        mensagemErro: error.message || 'Erro ao atualizar relação',
      });
      next(error);
    }
  }

  /**
   * DELETE /api/pag-com-rel/:id
   * Deleta relação página-componente
   */
  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const itemAnterior = await this.service.findById(id);
      const success = await this.service.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Relação Página-Componente não encontrada',
        });
      }

      // Registrar auditoria de deleção
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'deletar',
        entidade: 'pag_com_rel',
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
        entidade: 'pag_com_rel',
        entidadeId: id,
        dadosAnteriores: null,
        dadosNovos: null,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'erro',
        mensagemErro: error.message || 'Erro ao deletar relação',
      });
      next(error);
    }
  }
}

export default PagComRelController;

// Instância do controller
export const pagComRelController = new PagComRelController();

// Exporta métodos para compatibilidade com versão anterior
export const getAll = (req, res, next) =>
  pagComRelController.getAll(req, res, next);
export const getById = (req, res, next) =>
  pagComRelController.getById(req, res, next);
export const create = (req, res, next) =>
  pagComRelController.create(req, res, next);
export const update = (req, res, next) =>
  pagComRelController.update(req, res, next);
export const remove = (req, res, next) =>
  pagComRelController.remove(req, res, next);
