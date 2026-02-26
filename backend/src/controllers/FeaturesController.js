import { FeaturesService } from '../services/index.js';
import { getModels } from '../models/loader.js';

/**
 * FeaturesController - Refatorado para usar Service Layer
 */
export class FeaturesController {
  constructor() {
    const models = getModels();
    this.service = new FeaturesService(models.Features);
  }

  /**
   * GET /api/features
   * Lista todas as features com paginação
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
   * GET /api/features/:id
   * Busca feature por ID com todas as relações
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const item = await this.service.findById(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Feature não encontrada',
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
   * POST /api/features
   * Cria nova feature
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
   * PUT /api/features/:id
   * Atualiza feature
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const item = await this.service.update(id, req.body);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Feature não encontrada',
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
   * DELETE /api/features/:id
   * Deleta feature
   */
  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const success = await this.service.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Feature não encontrada',
        });
      }

      return res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}

// Instancia o controller
export const featuresController = new FeaturesController();

// Exporta métodos para compatibilidade com versão anterior
export const getAll = (req, res, next) => featuresController.getAll(req, res, next);
export const getById = (req, res, next) => featuresController.getById(req, res, next);
export const create = (req, res, next) => featuresController.create(req, res, next);
export const update = (req, res, next) => featuresController.update(req, res, next);
export const remove = (req, res, next) => featuresController.remove(req, res, next);
