import { ConfigTemaService } from '../services/index.js';
import { getModels } from '../models/loader.js';

/**
 * ConfigTemaController - Refatorado para usar Service Layer
 */
export class ConfigTemaController {
  constructor() {
    const models = getModels();
    this.service = new ConfigTemaService(models.ConfigTema);
  }

  /**
   * GET /api/config-temas
   * Lista todas as configurações com paginação
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
   * GET /api/config-temas/:id
   * Busca configuração por ID com todas as relações
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const item = await this.service.findById(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Configuração de Tema não encontrada',
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
   * POST /api/config-temas
   * Cria nova configuração
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
   * PUT /api/config-temas/:id
   * Atualiza configuração
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const item = await this.service.update(id, req.body);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Configuração de Tema não encontrada',
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
   * DELETE /api/config-temas/:id
   * Deleta configuração
   */
  async remove(req, res, next) {
    try {
      const { id } = req.params;
      const success = await this.service.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Configuração de Tema não encontrada',
        });
      }

      return res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}

// Instancia o controller
export const configTemaController = new ConfigTemaController();

// Exporta métodos para compatibilidade com versão anterior
export const getAll = (req, res, next) => configTemaController.getAll(req, res, next);
export const getById = (req, res, next) => configTemaController.getById(req, res, next);
export const create = (req, res, next) => configTemaController.create(req, res, next);
export const update = (req, res, next) => configTemaController.update(req, res, next);
export const remove = (req, res, next) => configTemaController.remove(req, res, next);
