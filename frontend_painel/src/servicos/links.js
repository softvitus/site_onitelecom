/**
 * @file Serviço de Gerenciamento de Links
 * @description Serviço especializado para gerenciar links.
 * Estende o serviço genérico com mapeamento de campos entre
 * frontend e backend (lin_nome → nome, etc).
 * 
 * @module servicos/links
 */

import criarServicoGenerico from './base';

// ============================================================================
// CONSTANTES
// ============================================================================

const ENDPOINT_LINKS = '/links';

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Mapeia dados do backend (lin_nome, lin_valor, etc)
 * para formato do frontend (nome, valor, etc)
 * 
 * @param {Object|Array} data - Dados retornados do backend
 * @returns {Object|Array} Dados mapeados para frontend
 */
const mapearLink = (data) => {
  if (Array.isArray(data)) {
    return data.map(mapearLink);
  }

  return {
    id: data.lin_id,
    temaId: data.lin_tem_id,
    categoria: data.lin_categoria,
    nome: data.lin_nome,
    valor: data.lin_valor,
  };
};

/**
 * Mapeia dados do frontend para formato esperado pelo backend
 * 
 * @param {Object} dados - Dados do frontend
 * @returns {Object} Dados formatados para backend
 */
const mapearLinkParaBackend = (dados) => {
  return {
    lin_tem_id: dados.temaId,
    lin_categoria: dados.categoria || '',
    lin_nome: dados.nome || '',
    lin_valor: dados.valor || '',
  };
};

// ============================================================================
// SERVIÇO DE LINKS
// ============================================================================

const LinksServiceBase = criarServicoGenerico(ENDPOINT_LINKS);

/**
 * Serviço para Gerenciar Links
 * 
 * Estende o serviço genérico com mapeamento automático de campos
 * entre o formato do frontend e do backend.
 */
const LinksService = {
  /**
   * Listar links com paginação
   * @param {number} [page=1] - Página
   * @param {number} [limit=10] - Itens por página
   * @param {Object} [filtros={}] - Filtros
   * @returns {Promise<Object>} Resultado com dados mapeados
   */
  listar: async (page = 1, limit = 10, filtros = {}) => {
    const resultado = await LinksServiceBase.listar(page, limit, filtros);
    
    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearLink(resultado.dados),
      };
    }
    
    return resultado;
  },

  /**
   * Obter um link por ID
   * @param {string} id - ID do link
   * @returns {Promise<Object>} Resultado com dados mapeados
   */
  obter: async (id) => {
    const resultado = await LinksServiceBase.obter(id);
    
    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearLink(resultado.dados),
      };
    }
    
    return resultado;
  },

  /**
   * Criar novo link
   * @param {Object} dados - Dados do link
   * @returns {Promise<Object>} Resultado da criação
   */
  criar: async (dados) => {
    const dadosFormatados = mapearLinkParaBackend(dados);
    const resultado = await LinksServiceBase.criar(dadosFormatados);
    
    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearLink(resultado.dados),
      };
    }
    
    return resultado;
  },

  /**
   * Atualizar um link
   * @param {string} id - ID do link
   * @param {Object} dados - Dados para atualizar
   * @returns {Promise<Object>} Resultado da atualização
   */
  atualizar: async (id, dados) => {
    const dadosFormatados = mapearLinkParaBackend(dados);
    const resultado = await LinksServiceBase.atualizar(id, dadosFormatados);
    
    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearLink(resultado.dados),
      };
    }
    
    return resultado;
  },

  /**
   * Deletar um link
   * @param {string} id - ID do link
   * @returns {Promise<Object>} Resultado da deleção
   */
  deletar: async (id) => {
    return await LinksServiceBase.deletar(id);
  },

  /**
   * Buscar links por critérios
   * @param {Object} criterios - Critérios de busca
   * @returns {Promise<Object>} Lista de links encontrados
   */
  buscar: async (criterios) => {
    const resultado = await LinksServiceBase.buscar(criterios);
    
    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearLink(resultado.dados),
      };
    }
    
    return resultado;
  },
};

export default LinksService;
