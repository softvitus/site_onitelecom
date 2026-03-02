/**
 * @file Serviço de Auditoria
 * @description API de rastreamento de ações e logs de auditoria
 * 
 * Endpoints:
 * - GET /auditoria - Listar logs com paginação e filtros
 * - GET /auditoria/estatisticas - Obter estatísticas de uso
 * - GET /auditoria/usuario/:usuarioId - Logs de um usuário específico
 * - GET /auditoria/entidade/:entidade/:entidadeId - Logs de uma entidade
 * - GET /auditoria/:id - Log específico
 */

import api from './api';

class AuditoriaService {
  /**
   * Listar logs de auditoria com filtros
   * @param {Object} filtros - Opções de filtro
   * @param {number} filtros.page - Número da página (padrão: 1)
   * @param {number} filtros.limit - Itens por página (padrão: 10, máx: 500)
   * @param {string} filtros.acao - Filtrar por ação (criar, editar, deletar, visualizar)
   * @param {string} filtros.entidade - Filtrar por entidade (parceiro, tema, etc)
   * @param {string} filtros.usuarioId - Filtrar por usuário
   * @param {string} filtros.dataInicio - Data início (ISO format)
   * @param {string} filtros.dataFim - Data fim (ISO format)
   * @returns {Promise<Object>} Resposta com dados e paginação
   */
  static async listar(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.page) params.append('page', filtros.page);
      if (filtros.limit) params.append('limit', Math.min(filtros.limit, 500));
      if (filtros.acao) params.append('acao', filtros.acao);
      if (filtros.entidade) params.append('entidade', filtros.entidade);
      if (filtros.usuarioId) params.append('usuarioId', filtros.usuarioId);
      if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
      if (filtros.dataFim) params.append('dataFim', filtros.dataFim);

      const response = await api.get(`/auditoria?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar auditoria:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de auditoria
   * @param {Object} filtros - Filtros opcionais
   * @param {string} filtros.dataInicio - Data início
   * @param {string} filtros.dataFim - Data fim
   * @returns {Promise<Object>} Estatísticas (total ações, erros, top ações, usuários ativos)
   */
  static async estatisticas(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
      if (filtros.dataFim) params.append('dataFim', filtros.dataFim);

      const response = await api.get(`/auditoria/estatisticas?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  /**
   * Obter logs de um usuário específico
   * @param {string} usuarioId - ID do usuário
   * @param {Object} opcoes - Opções de paginação
   * @returns {Promise<Object>} Logs do usuário
   */
  static async porUsuario(usuarioId, opcoes = {}) {
    try {
      const params = new URLSearchParams();
      
      if (opcoes.page) params.append('page', opcoes.page);
      if (opcoes.limit) params.append('limit', Math.min(opcoes.limit, 500));

      const response = await api.get(
        `/auditoria/usuario/${usuarioId}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao obter logs do usuário:', error);
      throw error;
    }
  }

  /**
   * Obter logs de uma entidade específica
   * @param {string} entidade - Tipo de entidade (parceiro, tema, etc)
   * @param {string} entidadeId - ID da entidade
   * @param {Object} opcoes - Opções de paginação
   * @returns {Promise<Object>} Logs da entidade
   */
  static async porEntidade(entidade, entidadeId, opcoes = {}) {
    try {
      const params = new URLSearchParams();
      
      if (opcoes.page) params.append('page', opcoes.page);
      if (opcoes.limit) params.append('limit', Math.min(opcoes.limit, 500));

      const response = await api.get(
        `/auditoria/entidade/${entidade}/${entidadeId}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao obter logs da entidade:', error);
      throw error;
    }
  }

  /**
   * Obter um log específico
   * @param {string} auditId - ID do log de auditoria
   * @returns {Promise<Object>} Dados do log
   */
  static async obter(auditId) {
    try {
      const response = await api.get(`/auditoria/${auditId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter log:', error);
      throw error;
    }
  }

  /**
   * Formatar uma ação em texto legível com ícone associado
   * @param {string} acao - Ação (criar, editar, deletar, visualizar)
   * @returns {Object} { texto, icone }
   */
  static formatarAcao(acao) {
    const acoes = {
      criar: { texto: 'Criar', icone: 'FiPlus' },
      editar: { texto: 'Editar', icone: 'FiEdit2' },
      deletar: { texto: 'Deletar', icone: 'FiTrash2' },
      visualizar: { texto: 'Visualizar', icone: 'FiEye' },
      login: { texto: 'Login', icone: 'FiLogIn' },
      logout: { texto: 'Logout', icone: 'FiLogOut' },
      alterar_senha: { texto: 'Alterar Senha', icone: 'FiLock' },
    };
    return acoes[acao] || { texto: acao, icone: 'FiInfo' };
  }

  /**
   * Formatar um status em texto legível com ícone
   * @param {string} status - Status (sucesso, erro)
   * @returns {Object} { texto, icone, classe }
   */
  static formatarStatus(status) {
    return status === 'sucesso' 
      ? { texto: 'Sucesso', icone: 'FiCheckCircle', classe: 'status-sucesso' }
      : { texto: 'Erro', icone: 'FiXCircle', classe: 'status-erro' };
  }
}

export default AuditoriaService;
