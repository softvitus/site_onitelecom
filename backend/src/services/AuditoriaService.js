/**
 * @module services/AuditoriaService
 * @description Serviço de rastreamento e auditoria de ações do sistema
 */

import { getModels } from '../models/loader.js';
import sequelize from '../config/sequelize.js';
import { Op } from 'sequelize';

/**
 * Serviço de Auditoria (métodos estáticos)
 */
export class AuditoriaService {
  /**
   * Registra uma ação de auditoria
   * @param {Object} dados - Dados da auditoria
   * @param {string} dados.usuarioId - ID do usuário que realizou a ação
   * @param {string} dados.acao - Tipo de ação (criar, editar, deletar, etc)
   * @param {string} dados.entidade - Tipo de entidade (parceiro, tema, usuario, etc)
   * @param {string} dados.entidadeId - ID da entidade afetada
   * @param {Object} dados.dadosAnteriores - Dados antes da modificação
   * @param {Object} dados.dadosNovos - Dados após a modificação
   * @param {string} dados.ip - IP do cliente
   * @param {string} dados.userAgent - User Agent do navegador
   * @param {string} dados.status - Status da operação (sucesso ou erro)
   * @param {string} dados.mensagemErro - Mensagem de erro (se aplicável)
   * @returns {Promise<Object>} Registro de auditoria criado
   */
  static async registrar(dados) {
    try {
      const models = getModels();

      // Validações básicas
      if (!dados.usuarioId) {
        console.warn('[AUDITORIA] usuarioId não fornecido');
        return null;
      }

      if (!dados.acao) {
        console.warn('[AUDITORIA] acao não fornecida');
        return null;
      }

      if (!dados.entidade) {
        console.warn('[AUDITORIA] entidade não fornecida');
        return null;
      }

      // Sanitizar dados sensíveis
      const dadosAnterioresSanitizados = this._sanitizarDados(
        dados.dadosAnteriores,
      );
      const dadosNovosSanitizados = this._sanitizarDados(dados.dadosNovos);

      // Criar registro de auditoria
      const auditoria = await models.Auditoria.create({
        aud_usuario_id: dados.usuarioId,
        aud_acao: dados.acao,
        aud_entidade: dados.entidade,
        aud_entidade_id: dados.entidadeId || null,
        aud_dados_anteriores: dadosAnterioresSanitizados,
        aud_dados_novos: dadosNovosSanitizados,
        aud_ip: dados.ip || null,
        aud_user_agent: dados.userAgent || null,
        aud_status: dados.status || 'sucesso',
        aud_mensagem_erro: dados.mensagemErro || null,
      });

      // eslint-disable-next-line no-console
      console.log(
        `[AUDITORIA] ${dados.acao.toUpperCase()} ${dados.entidade}:${
          dados.entidadeId || 'novo'
        } por usuário ${dados.usuarioId}`,
      );

      return auditoria;
    } catch (error) {
      console.error('[AUDITORIA] Erro ao registrar ação:', error.message);
      // Não lançar erro para não interromper a operação principal
      return null;
    }
  }

  /**
   * Remove campos sensíveis dos dados (senhas, tokens, etc)
   * @param {Object} dados - Dados a sanitizar
   * @returns {Object} Dados sanitizados
   */
  static _sanitizarDados(dados) {
    if (!dados || typeof dados !== 'object') {
      return dados;
    }

    const cópias = JSON.parse(JSON.stringify(dados));
    const camposSensiveis = [
      'senha',
      'usu_senha',
      'token',
      'refresh_token',
      'api_key',
    ];

    const sanitizar = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(sanitizar);
      }

      if (typeof obj === 'object' && obj !== null) {
        const sanitizado = {};
        for (const [chave, valor] of Object.entries(obj)) {
          if (
            camposSensiveis.some((campo) => chave.toLowerCase().includes(campo))
          ) {
            sanitizado[chave] = '[REDACTED]';
          } else {
            sanitizado[chave] = sanitizar(valor);
          }
        }
        return sanitizado;
      }

      return obj;
    };

    return sanitizar(cópias);
  }

  /**
   * Busca logs de auditoria com filtros
   * @param {Object} filtros - Critérios de busca
   * @param {string} filtros.usuarioId - ID do usuário
   * @param {string} filtros.acao - Tipo de ação
   * @param {string} filtros.entidade - Tipo de entidade
   * @param {string} filtros.entidadeId - ID da entidade
   * @param {Date} filtros.dataInicio - Data inicial
   * @param {Date} filtros.dataFim - Data final
   * @param {number} filtros.page - Página (padrão: 1)
   * @param {number} filtros.limit - Itens por página (padrão: 50)
   * @returns {Promise<Object>} Lista paginada de auditorias
   */
  static async buscar(filtros = {}) {
    try {
      const models = getModels();
      const page = filtros.page || 1;
      const limit = filtros.limit || 50;
      const offset = (page - 1) * limit;

      const where = {};

      if (filtros.usuarioId) {
        where.aud_usuario_id = filtros.usuarioId;
      }

      if (filtros.acao) {
        where.aud_acao = filtros.acao;
      }

      if (filtros.entidade) {
        where.aud_entidade = filtros.entidade;
      }

      if (filtros.entidadeId) {
        where.aud_entidade_id = filtros.entidadeId;
      }

      // Filtro de data
      if (filtros.dataInicio || filtros.dataFim) {
        where.createdAt = {};

        if (filtros.dataInicio) {
          where.createdAt[Op.gte] = new Date(filtros.dataInicio);
        }

        if (filtros.dataFim) {
          where.createdAt[Op.lte] = new Date(filtros.dataFim);
        }
      }

      const { count, rows } = await models.Auditoria.findAndCountAll({
        where,
        include: [
          {
            model: models.Usuario,
            as: 'usuario',
            attributes: ['usu_id', 'usu_nome', 'usu_email', 'usu_tipo'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return {
        sucesso: true,
        dados: rows,
        paginacao: {
          total: count,
          page,
          pages: Math.ceil(count / limit),
          limit,
        },
      };
    } catch (error) {
      console.error('[AUDITORIA] Erro ao buscar logs:', error.message);
      return {
        sucesso: false,
        erro: error.message,
        dados: [],
        paginacao: { total: 0, page: 1, pages: 0, limit: 50 },
      };
    }
  }

  /**
   * Retorna estatísticas de auditoria
   * @returns {Promise<Object>} Estatísticas
   */
  static async estatisticas() {
    try {
      const models = getModels();

      // Top 10 ações mais realizadas
      const acoesTop = await models.Auditoria.findAll({
        attributes: [
          'aud_acao',
          [sequelize.fn('COUNT', sequelize.col('*')), 'total'],
        ],
        group: ['aud_acao'],
        raw: true,
        order: [[sequelize.literal('total'), 'DESC']],
        limit: 10,
      });

      // Top 10 usuários mais ativos
      const usuariosData = await models.Auditoria.findAll({
        attributes: [
          'aud_usuario_id',
          [sequelize.fn('COUNT', sequelize.col('*')), 'total'],
        ],
        group: ['aud_usuario_id'],
        raw: true,
        order: [[sequelize.literal('total'), 'DESC']],
        limit: 10,
      });

      // Buscar nomes dos usuários
      const usuariosTop = await Promise.all(
        usuariosData.map(async (item) => {
          try {
            const usuario = await models.Usuario.findByPk(item.aud_usuario_id, {
              attributes: ['usu_id', 'usu_nome', 'usu_email'],
            });
            return {
              aud_usuario_id: item.aud_usuario_id,
              total: item.total,
              usuario: usuario
                ? {
                    usu_id: usuario.usu_id,
                    usu_nome: usuario.usu_nome,
                    usu_email: usuario.usu_email,
                  }
                : null,
            };
          } catch (err) {
            return item;
          }
        }),
      );

      // Total de erros
      const totalErros = await models.Auditoria.count({
        where: { aud_status: 'erro' },
      });

      // Total de ações
      const totalAcoes = await models.Auditoria.count();

      return {
        sucesso: true,
        estatisticas: {
          totalAcoes,
          totalErros,
          taxaErro:
            totalAcoes > 0
              ? parseFloat(((totalErros / totalAcoes) * 100).toFixed(2))
              : 0,
          acoesTop,
          usuariosTop,
        },
      };
    } catch (error) {
      console.error('[AUDITORIA] Erro ao gerar estatísticas:', error.message);
      return {
        sucesso: false,
        erro: error.message,
      };
    }
  }
}

export default AuditoriaService;
