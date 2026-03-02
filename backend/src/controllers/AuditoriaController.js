/**
 * @module controllers/AuditoriaController
 * @description Controller de consulta de logs de auditoria
 */

import { AuditoriaService } from '../services/index.js';

/**
 * Controller de Auditoria
 */
export class AuditoriaController {
  /**
   * GET /api/v1/auditoria
   * Lista logs de auditoria com filtros opcionais
   *
   * Query params:
   * - usuarioId: string
   * - acao: string (criar|editar|deletar|visualizar|inativar|ativar|login|logout)
   * - entidade: string (parceiro|tema|usuario|etc)
   * - entidadeId: string
   * - dataInicio: ISO date string
   * - dataFim: ISO date string
   * - page: number (default: 1)
   * - limit: number (default: 50)
   */
  async listar(req, res, next) {
    try {
      const filtros = {
        usuarioId: req.query.usuarioId,
        acao: req.query.acao,
        entidade: req.query.entidade,
        entidadeId: req.query.entidadeId,
        dataInicio: req.query.dataInicio,
        dataFim: req.query.dataFim,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50,
      };

      // Validar limite máximo de itens por página
      if (filtros.limit > 500) {
        filtros.limit = 500;
      }

      const resultado = await AuditoriaService.buscar(filtros);

      if (!resultado.sucesso) {
        return res.status(500).json({
          success: false,
          error: resultado.erro,
        });
      }

      return res.json({
        success: true,
        data: resultado.dados,
        pagination: resultado.paginacao,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auditoria/:id
   * Obtém um registro específico de auditoria
   */
  async obter(req, res, next) {
    try {
      const { Auditoria } = (await import('../models/loader.js')).getModels();
      const { id } = req.params;

      const auditoria = await Auditoria.findByPk(id, {
        include: [
          {
            model: Auditoria.sequelize.models.Usuario,
            as: 'usuario',
            attributes: ['usu_id', 'usu_nome', 'usu_email', 'usu_tipo'],
          },
        ],
      });

      if (!auditoria) {
        return res.status(404).json({
          success: false,
          error: 'Registro de auditoria não encontrado',
        });
      }

      return res.json({
        success: true,
        data: auditoria,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auditoria/estatisticas
   * Retorna estatísticas dos logs de auditoria
   */
  async estatisticas(req, res, next) {
    try {
      const resultado = await AuditoriaService.estatisticas();

      if (!resultado.sucesso) {
        return res.status(500).json({
          success: false,
          error: resultado.erro,
        });
      }

      return res.json({
        success: true,
        data: resultado.estatisticas,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auditoria/usuario/:usuarioId
   * Lista logs de um usuário específico
   */
  async porUsuario(req, res, next) {
    try {
      const { usuarioId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      const resultado = await AuditoriaService.buscar({
        usuarioId,
        page,
        limit,
      });

      if (!resultado.sucesso) {
        return res.status(500).json({
          success: false,
          error: resultado.erro,
        });
      }

      return res.json({
        success: true,
        data: resultado.dados,
        pagination: resultado.paginacao,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auditoria/entidade/:entidade/:entidadeId
   * Lista logs para uma entidade específica
   */
  async porEntidade(req, res, next) {
    try {
      const { entidade, entidadeId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      const resultado = await AuditoriaService.buscar({
        entidade,
        entidadeId,
        page,
        limit,
      });

      if (!resultado.sucesso) {
        return res.status(500).json({
          success: false,
          error: resultado.erro,
        });
      }

      return res.json({
        success: true,
        data: resultado.dados,
        pagination: resultado.paginacao,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AuditoriaController;
