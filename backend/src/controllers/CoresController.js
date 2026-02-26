import { CoresService } from '../services/index.js';
import { getModels } from '../models/loader.js';

/**
 * CoresController - Refatorado para usar Service Layer
 */
export class CoresController {
  constructor() {
    const models = getModels();
    this.service = new CoresService(models.Cores);
  }

  /**
   * GET /api/cores
   * Lista todas as cores com paginação
   */
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      
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
   * GET /api/cores/:id
   * Busca cor por ID com todas as relações
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const item = await this.service.findById(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Cor não encontrada',
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
   * POST /api/cores
   * Cria nova cor
   */
  async create(req, res, next) {
    try {
      const item = await this.service.create(req.body);

      return res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/cores/:id
   * Atualiza cor
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const item = await this.service.update(id, req.body);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Cor não encontrada',
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
   * DELETE /api/cores/:id
   * Deleta cor
   */
  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const success = await this.service.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Cor não encontrada',
        });
      }

      return res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}

// Instancia o controller
export const coresController = new CoresController();

// Exporta métodos para compatibilidade com versão anterior
export const getAll = (req, res, next) => coresController.getAll(req, res, next);
export const getById = (req, res, next) => coresController.getById(req, res, next);
export const create = (req, res, next) => coresController.create(req, res, next);
export const update = (req, res, next) => coresController.update(req, res, next);
export const remove = (req, res, next) => coresController.remove(req, res, next);
