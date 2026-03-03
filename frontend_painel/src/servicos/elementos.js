/**
 * @file Serviço de Gerenciamento de Elementos
 * @description Serviço especializado para gerenciar elementos.
 * Estende o serviço genérico com mapeamento de campos entre
 * frontend e backend (ele_nome → nome, etc).
 * 
 * @module servicos/elementos
 */

import criarServicoGenerico from './base';

// ============================================================================
// CONSTANTES
// ============================================================================

const ENDPOINT_ELEMENTOS = '/elementos';

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Mapeia dados do backend (ele_nome, ele_descricao, etc)
 * para formato do frontend (nome, descricao, etc)
 * 
 * @param {Object|Array} data - Dados retornados do backend
 * @returns {Object|Array} Dados mapeados para frontend
 */
const mapearElemento = (data) => {
  if (Array.isArray(data)) {
    return data.map(mapearElemento);
  }

  return {
    id: data.ele_id,
    nome: data.ele_nome,
    descricao: data.ele_descricao || '',
    ativo: data.ele_habilitado,
    obrigatorio: data.ele_obrigatório || false,
  };
};

/**
 * Mapeia dados do frontend para formato esperado pelo backend
 * 
 * @param {Object} dados - Dados do frontend
 * @returns {Object} Dados formatados para backend
 */
const mapearElementoParaBackend = (dados) => {
  return {
    ele_nome: dados.nome,
    ele_descricao: dados.descricao || null,
    ele_habilitado: dados.ativo !== false,
    ele_obrigatório: dados.obrigatorio === true,
  };
};

// ============================================================================
// SERVIÇO DE ELEMENTOS
// ============================================================================

const ElementosServiceBase = criarServicoGenerico(ENDPOINT_ELEMENTOS);

/**
 * Serviço para Gerenciar Elementos
 * 
 * Estende o serviço genérico com mapeamento automático de campos
 * entre o formato do frontend e do backend.
 */
const ElementosService = {
  /**
   * Listar elementos com paginação
   * @param {number} [page=1] - Página
   * @param {number} [limit=10] - Itens por página
   * @param {Object} [filtros={}] - Filtros
   * @returns {Promise<Object>} Resultado com dados mapeados
   */
  listar: async (page = 1, limit = 10, filtros = {}) => {
    const resultado = await ElementosServiceBase.listar(page, limit, filtros);
    
    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearElemento(resultado.dados),
      };
    }
    
    return resultado;
  },

  /**
   * Obter elemento específico
   * @param {string|number} id - ID do elemento
   * @returns {Promise<Object>} Elemento com dados mapeados
   */
  obter: async (id) => {
    const resultado = await ElementosServiceBase.obter(id);
    
    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearElemento(resultado.dados),
      };
    }
    
    return resultado;
  },

  /**
   * Criar novo elemento
   * @param {Object} dados - Dados do novo elemento
   * @returns {Promise<Object>} Resultado da criação
   */
  criar: async (dados) => {
    const dadosBackend = mapearElementoParaBackend(dados);
    return ElementosServiceBase.criar(dadosBackend);
  },

  /**
   * Atualizar elemento
   * @param {string|number} id - ID do elemento
   * @param {Object} dados - Dados atualizados
   * @returns {Promise<Object>} Resultado da atualização
   */
  atualizar: async (id, dados) => {
    const dadosBackend = mapearElementoParaBackend(dados);
    return ElementosServiceBase.atualizar(id, dadosBackend);
  },

  /**
   * Deletar elemento
   * @param {string|number} id - ID do elemento
   * @returns {Promise<Object>} Resultado da exclusão
   */
  deletar: (id) => ElementosServiceBase.deletar(id),

  /**
   * Buscar elementos por nome
   * @param {string} termo - Termo de busca
   * @param {number} [limit=20] - Limite de resultados
   * @returns {Promise<Object>} Resultados filtrados
   */
  buscar: async (termo, limit = 20) => {
    const resultado = await ElementosServiceBase.buscar(termo, limit);
    
    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearElemento(resultado.dados),
      };
    }
    
    return resultado;
  },
};

export default ElementosService;
