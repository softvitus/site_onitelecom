import { PaginaService } from '../services/index.js';
import { getModels } from '../models/loader.js';

/**
 * PaginaController - Refatorado para usar Service Layer
 */
export class PaginaController {
  constructor() {
    const models = getModels();
    this.service = new PaginaService(models.Pagina);
  }

  /**
   * GET /api/paginas
   * Lista todas as páginas com paginação
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

      return res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error) {
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
      const item = await this.service.update(id, req.body);

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
   * DELETE /api/paginas/:id
   * Deleta página
   */
  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const success = await this.service.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Página não encontrada',
        });
      }

      return res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}

// Instancia o controller
export const paginaController = new PaginaController();

// Exporta métodos para compatibilidade com versão anterior
export const getAll = (req, res, next) => paginaController.getAll(req, res, next);
export const getById = (req, res, next) => paginaController.getById(req, res, next);
export const create = (req, res, next) => paginaController.create(req, res, next);
export const update = (req, res, next) => paginaController.update(req, res, next);
export const remove = (req, res, next) => paginaController.remove(req, res, next);
