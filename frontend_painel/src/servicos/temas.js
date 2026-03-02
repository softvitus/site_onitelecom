/**
 * @file Serviço de Gerenciamento de Temas
 * @description Serviço especializado para gerenciar temas.
 * Estende o serviço genérico com mapeamento de campos entre
 * frontend e backend (tem_nome → nome, etc).
 * 
 * @module servicos/temas
 */

import criarServicoGenerico from './base';

// ============================================================================
// CONSTANTES
// ============================================================================

const ENDPOINT_TEMAS = '/temas';

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Mapeia dados do backend (tem_nome, tem_par_id, etc)
 * para formato do frontend (nome, parceiroId, etc)
 * 
 * @param {Object|Array} data - Dados retornados do backend
 * @returns {Object|Array} Dados mapeados para frontend
 */
const mapearTema = (data) => {
  if (Array.isArray(data)) {
    return data.map(mapearTema);
  }

  return {
    id: data.tem_id,
    nome: data.tem_nome,
    parceiroId: data.tem_par_id,
    criadoEm: data.createdAt,
    atualizadoEm: data.updatedAt,
  };
};

/**
 * Mapeia dados do frontend para formato esperado pelo backend
 * 
 * @param {Object} dados - Dados do frontend
 * @returns {Object} Dados formatados para backend
 */
const mapearTemaParaBackend = (dados) => {
  return {
    tem_nome: dados.nome,
    tem_par_id: dados.parceiroId || null,
  };
};

// ============================================================================
// SERVIÇO DE TEMAS
// ============================================================================

const TemasServiceBase = criarServicoGenerico(ENDPOINT_TEMAS);

/**
 * Serviço para Gerenciar Temas
 * 
 * Estende o serviço genérico com mapeamento automático de campos
 * entre o formato do frontend e do backend.
 */
const TemasService = {
  /**
   * Listar temas com paginação
   * @param {number} [page=1] - Página
   * @param {number} [limit=10] - Itens por página
   * @param {Object} [filtros={}] - Filtros
   * @returns {Promise<Object>} Resultado com dados mapeados
   */
  listar: async (page = 1, limit = 10, filtros = {}) => {
    const resultado = await TemasServiceBase.listar(page, limit, filtros);
    
    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearTema(resultado.dados),
      };
    }
    
    return resultado;
  },

  /**
   * Obter tema específico
   * @param {string|number} id - ID do tema
   * @returns {Promise<Object>} Tema com dados mapeados
   */
  obter: async (id) => {
    const resultado = await TemasServiceBase.obter(id);
    
    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearTema(resultado.dados),
      };
    }
    
    return resultado;
  },

  /**
   * Criar novo tema
   * @param {Object} dados - Dados do novo tema
   * @returns {Promise<Object>} Resultado da criação
   */
  criar: async (dados) => {
    const dadosBackend = mapearTemaParaBackend(dados);
    return TemasServiceBase.criar(dadosBackend);
  },

  /**
   * Atualizar tema
   * @param {string|number} id - ID do tema
   * @param {Object} dados - Dados atualizados
   * @returns {Promise<Object>} Resultado da atualização
   */
  atualizar: async (id, dados) => {
    const dadosBackend = mapearTemaParaBackend(dados);
    return TemasServiceBase.atualizar(id, dadosBackend);
  },

  /**
   * Deletar tema
   * @param {string|number} id - ID do tema
   * @returns {Promise<Object>} Resultado da exclusão
   */
  deletar: (id) => TemasServiceBase.deletar(id),

  /**
   * Buscar temas
   * @param {string} query - Termo de busca
   * @param {number} [page=1] - Página
   * @param {number} [limit=10] - Itens por página
   * @returns {Promise<Object>} Resultado da busca
   */
  buscar: (query, page = 1, limit = 10) => TemasService.listar(page, limit, { search: query }),
};

export default TemasService;
