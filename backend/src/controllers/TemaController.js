/**
 * @module controllers/TemaController
 * @description Controller de gerenciamento de temas
 */

import { TemaService } from '../services/index.js';
import { AuditoriaService } from '../services/AuditoriaService.js';
import { getModels } from '../models/loader.js';

export class TemaController {
  constructor() {
    const models = getModels();
    this.service = new TemaService(models.Tema);
  }

  /**
   * GET /api/temas
   * Lista todos os temas com paginação
   * Filtra por parceiro se usuário não for admin
   */
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      
      // Construir filtros
      const filtros = {};
      
      // Se não é admin e tem parceiroId, filtrar por parceiro
      if (req.user?.tipo !== 'admin' && req.user?.parceiroId) {
        filtros.tem_par_id = req.user.parceiroId;
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
   * GET /api/temas/:id
   * Busca tema por ID com todas as relações
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const item = await this.service.findById(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Tema não encontrado',
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
   * POST /api/temas
   * Cria novo tema
   */
  async create(req, res, next) {
    try {
      const item = await this.service.create(req.body);

      // Registrar auditoria de criação
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'criar',
        entidade: 'tema',
        entidadeId: item.tem_id,
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
        entidade: 'tema',
        entidadeId: null,
        dadosAnteriores: null,
        dadosNovos: req.body,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'erro',
        mensagemErro: error.message || 'Erro ao criar tema',
      });
      next(error);
    }
  }

  /**
   * PUT /api/temas/:id
   * Atualiza tema
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const itemAnterior = await this.service.findById(id);
      const item = await this.service.update(id, req.body);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Tema não encontrado',
        });
      }

      // Registrar auditoria de atualização
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'atualizar',
        entidade: 'tema',
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
        entidade: 'tema',
        entidadeId: id,
        dadosAnteriores: null,
        dadosNovos: req.body,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'erro',
        mensagemErro: error.message || 'Erro ao atualizar tema',
      });
      next(error);
    }
  }

  /**
   * DELETE /api/temas/:id
   * Deleta tema
   */
  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const itemAnterior = await this.service.findById(id);
      const success = await this.service.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Tema não encontrado',
        });
      }

      // Registrar auditoria de deleção
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'deletar',
        entidade: 'tema',
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
        entidade: 'tema',
        entidadeId: id,
        dadosAnteriores: null,
        dadosNovos: null,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'erro',
        mensagemErro: error.message || 'Erro ao deletar tema',
      });
      next(error);
    }
  }
}

export default TemaController;

// Instância do controller
export const temaController = new TemaController();
// Exporta métodos para compatibilidade com versão anterior
export const getAll = (req, res, next) => temaController.getAll(req, res, next);
export const getById = (req, res, next) => temaController.getById(req, res, next);
export const create = (req, res, next) => temaController.create(req, res, next);
export const update = (req, res, next) => temaController.update(req, res, next);
export const remove = (req, res, next) => temaController.remove(req, res, next);
