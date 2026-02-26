import { TextosService } from '../services/index.js';
import { getModels } from '../models/loader.js';

/**
 * TextosController - Refatorado para usar Service Layer
 */
export class TextosController {
  constructor() {
    const models = getModels();
    this.service = new TextosService(models.Textos);
  }

  /**
   * GET /api/textos
   * Lista todos os textos com paginação
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
   * GET /api/textos/:id
   * Busca texto por ID com todas as relações
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const item = await this.service.findById(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Texto não encontrado',
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
   * POST /api/textos
   * Cria novo texto
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
   * PUT /api/textos/:id
   * Atualiza texto
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const item = await this.service.update(id, req.body);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Texto não encontrado',
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
   * DELETE /api/textos/:id
   * Deleta texto
   */
  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const success = await this.service.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Texto não encontrado',
        });
      }

      return res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}

// Instancia o controller
export const textosController = new TextosController();

// Exporta métodos para compatibilidade com versão anterior
export const getAll = (req, res, next) => textosController.getAll(req, res, next);
export const getById = (req, res, next) => textosController.getById(req, res, next);
export const create = (req, res, next) => textosController.create(req, res, next);
export const update = (req, res, next) => textosController.update(req, res, next);
export const remove = (req, res, next) => textosController.remove(req, res, next);
