import { LinksService } from '../services/index.js';
import { getModels } from '../models/loader.js';

/**
 * LinksController - Refatorado para usar Service Layer
 */
export class LinksController {
  constructor() {
    const models = getModels();
    this.service = new LinksService(models.Links);
  }

  /**
   * GET /api/links
   * Lista todos os links com paginação
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

      return res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error) {
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
      const item = await this.service.update(id, req.body);

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
   * DELETE /api/links/:id
   * Deleta link
   */
  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const success = await this.service.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Link não encontrado',
        });
      }

      return res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}

// Instancia o controller
export const linksController = new LinksController();

// Exporta métodos para compatibilidade com versão anterior
export const getAll = (req, res, next) => linksController.getAll(req, res, next);
export const getById = (req, res, next) => linksController.getById(req, res, next);
export const create = (req, res, next) => linksController.create(req, res, next);
export const update = (req, res, next) => linksController.update(req, res, next);
export const remove = (req, res, next) => linksController.remove(req, res, next);
