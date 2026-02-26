
import { ComEleRelService } from '../services/index.js';
import { getModels } from '../models/loader.js';

/**
 * ComEleRelController - Refatorado para usar Service Layer
 */
export class ComEleRelController {
  constructor() {
    const models = getModels();
    this.service = new ComEleRelService(models.ComEleRel);
  }

  /**
   * GET /api/com-ele-rel
   * Lista todas as relações componente-elemento com paginação
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
   * GET /api/com-ele-rel/:id
   * Busca relação componente-elemento por ID
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const item = await this.service.findById(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Relação Componente-Elemento não encontrada',
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
   * POST /api/com-ele-rel
   * Cria nova relação componente-elemento
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
   * PUT /api/com-ele-rel/:id
   * Atualiza relação componente-elemento
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const item = await this.service.update(id, req.body);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Relação Componente-Elemento não encontrada',
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
   * DELETE /api/com-ele-rel/:id
   * Deleta relação componente-elemento
   */
  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const success = await this.service.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Relação Componente-Elemento não encontrada',
        });
      }

      return res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}

// Instancia o controller
export const comEleRelController = new ComEleRelController();
// Exporta métodos para compatibilidade com versão anterior
export const getAll = (req, res, next) => comEleRelController.getAll(req, res, next);
export const getById = (req, res, next) => comEleRelController.getById(req, res, next);
export const create = (req, res, next) => comEleRelController.create(req, res, next);
export const update = (req, res, next) => comEleRelController.update(req, res, next);
export const remove = (req, res, next) => comEleRelController.remove(req, res, next);
