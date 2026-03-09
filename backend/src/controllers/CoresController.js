/**
 * @module controllers/CoresController
 * @description Controller de gerenciamento de cores
 */

import { CoresService } from '../services/index.js';
import { AuditoriaService } from '../services/AuditoriaService.js';
import { getModels } from '../models/loader.js';
import sequelize from '../config/sequelize.js';
import { QueryTypes } from 'sequelize';

/**
 * Controller de Cores
 */
export class CoresController {
  constructor() {
    const models = getModels();
    this.service = new CoresService(models.Cores);
  }

  /**
   * GET /api/cores
   * Lista todas as cores com paginação
   */
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Query para contar total
      const countResult = await sequelize.query(
        'SELECT COUNT(*) as total FROM "0008_Cores" WHERE "cor_nome" ILIKE :search OR "cor_categoria" ILIKE :search',
        {
          replacements: { search: `%${search}%` },
          type: QueryTypes.SELECT,
        },
      );
      const total = parseInt(countResult[0].total);

      // Query para listar com paginação
      const rows = await sequelize.query(
        'SELECT * FROM "0008_Cores" WHERE "cor_nome" ILIKE :search OR "cor_categoria" ILIKE :search ORDER BY "cor_categoria" ASC, "cor_nome" ASC LIMIT :limit OFFSET :offset',
        {
          replacements: {
            search: `%${search}%`,
            limit: parseInt(limit),
            offset,
          },
          type: QueryTypes.SELECT,
        },
      );

      return res.json({
        success: true,
        data: rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cores/:id
   * Busca cor por ID com todas as relações
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await sequelize.query(
        'SELECT * FROM "0008_Cores" WHERE "cor_id" = :id',
        {
          replacements: { id },
          type: QueryTypes.SELECT,
        },
      );

      const item = result[0];
      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Cor não encontrada',
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
   * POST /api/cores
   * Cria nova cor
   */
  async create(req, res, next) {
    try {
      const { cor_tem_id, cor_categoria, cor_nome, cor_valor } = req.body;

      // Validar campos obrigatórios
      if (!cor_tem_id || !cor_categoria || !cor_nome || !cor_valor) {
        return res.status(400).json({
          success: false,
          error:
            'cor_tem_id, cor_categoria, cor_nome e cor_valor são obrigatórios',
        });
      }

      // Import UUID para gerar ID
      const { v4: uuidv4 } = await import('uuid');
      const cor_id = uuidv4();
      const now = new Date();

      // Inserir nova cor
      const result = await sequelize.query(
        `INSERT INTO "0008_Cores" (
          "cor_id", "cor_tem_id", "cor_categoria", "cor_nome", "cor_valor", "createdAt", "updatedAt"
        ) VALUES (
          :cor_id, :cor_tem_id, :cor_categoria, :cor_nome, :cor_valor, :createdAt, :updatedAt
        ) RETURNING *`,
        {
          replacements: {
            cor_id,
            cor_tem_id,
            cor_categoria,
            cor_nome,
            cor_valor,
            createdAt: now,
            updatedAt: now,
          },
          type: QueryTypes.SELECT,
        },
      );

      const item = result[0];

      // Registrar auditoria de criação
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'criar',
        entidade: 'cores',
        entidadeId: item.cor_id,
        dadosAnteriores: null,
        dadosNovos: item,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'sucesso',
        mensagemErro: null,
      });

      return res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error) {
      // Registrar auditoria de erro na criação
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'criar',
        entidade: 'cores',
        entidadeId: null,
        dadosAnteriores: null,
        dadosNovos: req.body,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'erro',
        mensagemErro: error.message || 'Erro ao criar cor',
      });
      next(error);
    }
  }

  /**
   * PUT /api/cores/:id
   * Atualiza cor
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { cor_categoria, cor_nome, cor_valor } = req.body;

      // Buscar dados antigos para auditoria
      const oldResult = await sequelize.query(
        'SELECT * FROM "0008_Cores" WHERE "cor_id" = :id',
        { replacements: { id }, type: QueryTypes.SELECT },
      );

      const itemAnterior = oldResult[0];
      if (!itemAnterior) {
        return res.status(404).json({
          success: false,
          error: 'Cor não encontrada',
        });
      }

      // Construir UPDATE query com apenas os campos fornecidos
      const updateFields = [];
      const replacements = { id };

      if (cor_categoria !== undefined) {
        updateFields.push('"cor_categoria" = :cor_categoria');
        replacements.cor_categoria = cor_categoria;
      }
      if (cor_nome !== undefined) {
        updateFields.push('"cor_nome" = :cor_nome');
        replacements.cor_nome = cor_nome;
      }
      if (cor_valor !== undefined) {
        updateFields.push('"cor_valor" = :cor_valor');
        replacements.cor_valor = cor_valor;
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Nenhum campo para atualizar',
        });
      }

      // Executar UPDATE
      const result = await sequelize.query(
        `UPDATE "0008_Cores" SET ${updateFields.join(', ')} WHERE "cor_id" = :id RETURNING *`,
        { replacements, type: QueryTypes.SELECT },
      );

      const item = result[0];

      // Registrar auditoria de atualização
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'atualizar',
        entidade: 'cores',
        entidadeId: id,
        dadosAnteriores: itemAnterior,
        dadosNovos: item,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'sucesso',
        mensagemErro: null,
      });

      return res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      const { id } = req.params;
      // Registrar auditoria de erro na atualização
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'atualizar',
        entidade: 'cores',
        entidadeId: id,
        dadosAnteriores: null,
        dadosNovos: req.body,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'erro',
        mensagemErro: error.message || 'Erro ao atualizar cor',
      });
      next(error);
    }
  }

  /**
   * DELETE /api/cores/:id
   * Deleta cor
   */
  async remove(req, res, next) {
    try {
      const { id } = req.params;

      // Buscar dados antigos para auditoria
      const oldResult = await sequelize.query(
        'SELECT * FROM "0008_Cores" WHERE "cor_id" = :id',
        { replacements: { id }, type: QueryTypes.SELECT },
      );

      const itemAnterior = oldResult[0];
      if (!itemAnterior) {
        return res.status(404).json({
          success: false,
          error: 'Cor não encontrada',
        });
      }

      // Deletar cor
      await sequelize.query('DELETE FROM "0008_Cores" WHERE "cor_id" = :id', {
        replacements: { id },
        type: QueryTypes.DELETE,
      });

      // Registrar auditoria de deleção
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'deletar',
        entidade: 'cores',
        entidadeId: id,
        dadosAnteriores: itemAnterior,
        dadosNovos: null,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'sucesso',
        mensagemErro: null,
      });

      return res.status(204).end();
    } catch (error) {
      const { id } = req.params;
      // Registrar auditoria de erro na deleção
      await AuditoriaService.registrar({
        usuarioId: req.user?.id,
        acao: 'deletar',
        entidade: 'cores',
        entidadeId: id,
        dadosAnteriores: null,
        dadosNovos: null,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'erro',
        mensagemErro: error.message || 'Erro ao deletar cor',
      });
      next(error);
    }
  }

  /**
   * GET /api/cores/componente/:componente
   * Lista cores por componente
   */
  async getByComponente(req, res, next) {
    try {
      const { componente } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const countResult = await sequelize.query(
        'SELECT COUNT(*) as total FROM "0008_Cores" WHERE "cor_componente" = :componente',
        { replacements: { componente }, type: QueryTypes.SELECT },
      );
      const total = parseInt(countResult[0].total);

      const rows = await sequelize.query(
        'SELECT * FROM "0008_Cores" WHERE "cor_componente" = :componente ORDER BY "cor_categoria" ASC, "cor_nome" ASC LIMIT :limit OFFSET :offset',
        {
          replacements: { componente, limit: parseInt(limit), offset },
          type: QueryTypes.SELECT,
        },
      );

      return res.json({
        success: true,
        componente,
        data: rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cores/categoria/:categoria
   * Lista cores por categoria
   */
  async getByCategoria(req, res, next) {
    try {
      const { categoria } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const countResult = await sequelize.query(
        'SELECT COUNT(*) as total FROM "0008_Cores" WHERE "cor_categoria" = :categoria',
        { replacements: { categoria }, type: QueryTypes.SELECT },
      );
      const total = parseInt(countResult[0].total);

      const rows = await sequelize.query(
        'SELECT * FROM "0008_Cores" WHERE "cor_categoria" = :categoria ORDER BY "cor_categoria" ASC, "cor_nome" ASC LIMIT :limit OFFSET :offset',
        {
          replacements: { categoria, limit: parseInt(limit), offset },
          type: QueryTypes.SELECT,
        },
      );

      return res.json({
        success: true,
        categoria,
        data: rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cores/ativas/:temaId
   * Lista apenas cores ativas de um tema
   */
  async getAtivas(req, res, next) {
    try {
      const { temaId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const countResult = await sequelize.query(
        'SELECT COUNT(*) as total FROM "0008_Cores" WHERE "cor_tem_id" = :temaId AND "cor_ativo" = true',
        { replacements: { temaId }, type: QueryTypes.SELECT },
      );
      const total = parseInt(countResult[0].total);

      const rows = await sequelize.query(
        'SELECT * FROM "0008_Cores" WHERE "cor_tem_id" = :temaId AND "cor_ativo" = true ORDER BY "cor_categoria" ASC, "cor_nome" ASC LIMIT :limit OFFSET :offset',
        {
          replacements: { temaId, limit: parseInt(limit), offset },
          type: QueryTypes.SELECT,
        },
      );

      return res.json({
        success: true,
        temaId,
        data: rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cores/componente/:componente/ativas
   * Lista cores ativas de um componente
   */
  async getAtivasByComponente(req, res, next) {
    try {
      const { componente } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const countResult = await sequelize.query(
        'SELECT COUNT(*) as total FROM "0008_Cores" WHERE "cor_componente" = :componente AND "cor_ativo" = true',
        { replacements: { componente }, type: QueryTypes.SELECT },
      );
      const total = parseInt(countResult[0].total);

      const rows = await sequelize.query(
        'SELECT * FROM "0008_Cores" WHERE "cor_componente" = :componente AND "cor_ativo" = true ORDER BY "cor_categoria" ASC, "cor_nome" ASC LIMIT :limit OFFSET :offset',
        {
          replacements: { componente, limit: parseInt(limit), offset },
          type: QueryTypes.SELECT,
        },
      );

      return res.json({
        success: true,
        componente,
        data: rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cores/importar
   * Importa paleta de cores
   */
  async importarPaleta(req, res, next) {
    try {
      const { temaId, cores } = req.body;

      if (!temaId || !cores || !Array.isArray(cores)) {
        return res.status(400).json({
          success: false,
          error: 'temaId e cores array são obrigatórios',
        });
      }

      const imported = [];
      const { v4: uuidv4 } = await import('uuid');
      const now = new Date();

      for (const cor of cores) {
        // Validar dados obrigatórios da cor
        const { nome, valor, categoria } = cor;
        if (!nome || !valor || !categoria) {
          return res.status(400).json({
            success: false,
            error: `Cor inválida: campos nome, valor e categoria são obrigatórios`,
          });
        }

        const cor_id = uuidv4();

        // Inserir cor individual
        const result = await sequelize.query(
          `INSERT INTO "0008_Cores" (
            "cor_id", "cor_tem_id", "cor_categoria", "cor_nome", "cor_valor", "createdAt", "updatedAt"
          ) VALUES (
            :cor_id, :cor_tem_id, :cor_categoria, :cor_nome, :cor_valor, :createdAt, :updatedAt
          ) RETURNING *`,
          {
            replacements: {
              cor_id,
              cor_tem_id: temaId,
              cor_categoria: categoria,
              cor_nome: nome,
              cor_valor: valor,
              createdAt: now,
              updatedAt: now,
            },
            type: QueryTypes.SELECT,
          },
        );

        imported.push(result[0]);
      }

      return res.status(201).json({
        success: true,
        message: `${imported.length} cores importadas com sucesso`,
        data: imported,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cores/exportar/:temaId
   * Exporta paleta de cores em JSON
   */
  async exportarPaleta(req, res, next) {
    try {
      const { temaId } = req.params;

      // Buscar todas as cores do tema
      const cores = await sequelize.query(
        'SELECT * FROM "0008_Cores" WHERE "cor_tem_id" = :temaId ORDER BY "cor_categoria" ASC, "cor_nome" ASC',
        { replacements: { temaId }, type: QueryTypes.SELECT },
      );

      return res.json({
        success: true,
        data: {
          tema_id: temaId,
          totalCores: cores.length,
          cores: cores.map((c) => ({
            id: c.cor_id,
            nome: c.cor_nome,
            valor: c.cor_valor,
            categoria: c.cor_categoria,
            componente: c.cor_componente,
            variavel_ref: c.cor_variavel_ref,
            descricao: c.cor_descricao,
            ativo: c.cor_ativo,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default CoresController;

// Instância do controller
export const coresController = new CoresController();

// Exporta métodos para compatibilidade com versão anterior
export const getAll = (req, res, next) =>
  coresController.getAll(req, res, next);
export const getById = (req, res, next) =>
  coresController.getById(req, res, next);
export const create = (req, res, next) =>
  coresController.create(req, res, next);
export const update = (req, res, next) =>
  coresController.update(req, res, next);
export const remove = (req, res, next) =>
  coresController.remove(req, res, next);
