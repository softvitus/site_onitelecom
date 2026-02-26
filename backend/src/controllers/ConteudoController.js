import { ConteudoService } from '../services/index.js';
import { getModels } from '../models/loader.js';

/**
 * ConteudoController - Refatorado para usar Service Layer
 */
export class ConteudoController {
  constructor() {
    const models = getModels();
    this.service = new ConteudoService(models.Conteudo);
  }

  /**
   * GET /api/conteudos
   * Lista todos os conteúdos com paginação
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
   * GET /api/conteudos/:id
   * Busca conteúdo por ID com todas as relações
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const item = await this.service.findById(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Conteúdo não encontrado',
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
   * POST /api/conteudos
   * Cria novo conteúdo
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
   * PUT /api/conteudos/:id
   * Atualiza conteúdo
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const item = await this.service.update(id, req.body);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Conteúdo não encontrado',
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
   * DELETE /api/conteudos/:id
   * Deleta conteúdo
   */
  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const success = await this.service.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Conteúdo não encontrado',
        });
      }

      return res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}

// Instancia o controller
export const conteudoController = new ConteudoController();

// Exporta métodos para compatibilidade com versão anterior
export const getAll = (req, res, next) => conteudoController.getAll(req, res, next);
export const getById = (req, res, next) => conteudoController.getById(req, res, next);
export const create = (req, res, next) => conteudoController.create(req, res, next);
export const update = (req, res, next) => conteudoController.update(req, res, next);
export const remove = (req, res, next) => conteudoController.remove(req, res, next);
