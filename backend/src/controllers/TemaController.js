
import { TemaService } from '../services/index.js';
import { getModels } from '../models/loader.js';

/**
 * TemaController - Refatorado para usar Service Layer
 */
export class TemaController {
  constructor() {
    const models = getModels();
    this.service = new TemaService(models.Tema);
  }

  /**
   * GET /api/temas
   * Lista todos os temas com paginação
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

      return res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error) {
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
      const item = await this.service.update(id, req.body);

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
   * DELETE /api/temas/:id
   * Deleta tema
   */
  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const success = await this.service.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Tema não encontrado',
        });
      }

      return res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}


// Instancia o controller
export const temaController = new TemaController();
// Exporta métodos para compatibilidade com versão anterior
export const getAll = (req, res, next) => temaController.getAll(req, res, next);
export const getById = (req, res, next) => temaController.getById(req, res, next);
export const create = (req, res, next) => temaController.create(req, res, next);
export const update = (req, res, next) => temaController.update(req, res, next);
export const remove = (req, res, next) => temaController.remove(req, res, next);
