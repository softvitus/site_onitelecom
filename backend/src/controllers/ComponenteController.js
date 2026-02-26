
import { ComponenteService } from '../services/index.js';
import { getModels } from '../models/loader.js';

/**
 * ComponenteController - Refatorado para usar Service Layer
 */
export class ComponenteController {
  constructor() {
    const models = getModels();
    this.service = new ComponenteService(models.Componente);
  }

  /**
   * GET /api/componentes
   * Lista todos os componentes com paginação
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

      return res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error) {
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
      const item = await this.service.update(id, req.body);

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
   * DELETE /api/componentes/:id
   * Deleta componente
   */
  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const success = await this.service.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Componente não encontrado',
        });
      }

      return res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}


// Instancia o controller
export const componenteController = new ComponenteController();
// Exporta métodos para compatibilidade com versão anterior
export const getAll = (req, res, next) => componenteController.getAll(req, res, next);
