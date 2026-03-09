/**
 * @module controllers/ComponenteController
 * @description Controller de gerenciamento de componentes
 */

import { ComponenteService } from '../services/index.js';
import { AuditoriaService } from '../services/AuditoriaService.js';
import { getModels } from '../models/loader.js';

export class ComponenteController {
  constructor() {
    const models = getModels();
    this.service = new ComponenteService(models.Componente);
  }

  /**
   * GET /api/componentes
   * Lista componentes com paginação
   * Filtra por parceiro se usuário não for admin
   */
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;

      // Construir filtros
      const filtros = {};

      // Se não é admin e tem parceiroId, filtrar por parceiro
      // Componentes são vinculados a páginas, que têm relação com parceiro
      if (req.user?.tipo !== 'admin' && req.user?.parceiroId) {
        filtros.parceiroId = req.user.parceiroId;
      }

      const result = await this.service.findAll(filtros, {
        page: parseInt(page),
        limit: parseInt(limit),
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
   * GET /api/componentes/:id
   * Busca componente por ID com todas as relações
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const item = await this.service.findById(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Componente não encontrado',
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
   * POST /api/componentes
   * Cria novo componente
   */
  async create(req, res, next) {
    try {
      const item = await this.service.create(req.body);

      // Registrar auditoria de criação
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'criar',
        entidade: 'componente',
        entidadeId: item.com_id,
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
        entidade: 'componente',
        entidadeId: null,
        dadosAnteriores: null,
        dadosNovos: req.body,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'erro',
        mensagemErro: error.message || 'Erro ao criar componente',
      });
      next(error);
    }
  }

  /**
   * PUT /api/componentes/:id
   * Atualiza componente
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const itemAnterior = await this.service.findById(id);
      const item = await this.service.update(id, req.body);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Componente não encontrado',
        });
      }

      // Registrar auditoria de atualização
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'atualizar',
        entidade: 'componente',
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
        entidade: 'componente',
        entidadeId: id,
        dadosAnteriores: null,
        dadosNovos: req.body,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'erro',
        mensagemErro: error.message || 'Erro ao atualizar componente',
      });
      next(error);
    }
  }

  /**
   * DELETE /api/componentes/:id
   * Deleta componente
   */
  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const itemAnterior = await this.service.findById(id);
      const success = await this.service.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Componente não encontrado',
        });
      }

      // Registrar auditoria de deleção
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'deletar',
        entidade: 'componente',
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
        entidade: 'componente',
        entidadeId: id,
        dadosAnteriores: null,
        dadosNovos: null,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'erro',
        mensagemErro: error.message || 'Erro ao deletar componente',
      });
      next(error);
    }
  }
}

export default ComponenteController;

// Instância do controller
export const componenteController = new ComponenteController();
// Exporta métodos para compatibilidade com versão anterior
export const getAll = (req, res, next) =>
  componenteController.getAll(req, res, next);
