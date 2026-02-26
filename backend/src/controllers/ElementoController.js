import { ElementoService } from '../services/index.js';
import { getModels } from '../models/loader.js';

/**
 * ElementoController - Refatorado para usar Service Layer
 */
export class ElementoController {
  constructor() {
    const models = getModels();
    this.service = new ElementoService(models.Elemento);
  }

  /**
   * GET /api/elementos
   * Lista todos os elementos com paginação
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
   * GET /api/elementos/:id
   * Busca elemento por ID com todas as relações
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const item = await this.service.findById(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Elemento não encontrado',
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
   * POST /api/elementos
   * Cria novo elemento
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
   * PUT /api/elementos/:id
   * Atualiza elemento
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const item = await this.service.update(id, req.body);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Elemento não encontrado',
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
   * DELETE /api/elementos/:id
   * Deleta elemento
   */
  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const success = await this.service.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Elemento não encontrado',
        });
      }

      return res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}

// Instancia o controller
export const elementoController = new ElementoController();

// Exporta métodos para compatibilidade com versão anterior
export const getAll = (req, res, next) => elementoController.getAll(req, res, next);
export const getById = (req, res, next) => elementoController.getById(req, res, next);
export const create = (req, res, next) => elementoController.create(req, res, next);
export const update = (req, res, next) => elementoController.update(req, res, next);
export const remove = (req, res, next) => elementoController.remove(req, res, next);
