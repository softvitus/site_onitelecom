/**
 * @file Serviço de Gerenciamento de Componentes
 * @description Serviço especializado para gerenciar componentes.
 * Estende o serviço genérico com mapeamento de campos entre
 * frontend e backend (com_id → id, com_nome → nome, etc).
 * 
 * @module servicos/componentes
 */

import criarServicoGenerico from './base';

// ============================================================================
// CONSTANTES
// ============================================================================

const ENDPOINT_COMPONENTES = '/componentes';

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Mapeia dados do backend (com_nome, com_descricao, etc)
 * para formato do frontend (nome, descricao, etc)
 * 
 * @param {Object|Array} data - Dados retornados do backend
 * @returns {Object|Array} Dados mapeados para frontend
 */
const mapearComponente = (data) => {
  if (Array.isArray(data)) {
    return data.map(mapearComponente);
  }

  return {
    id: data.com_id,
    nome: data.com_nome,
    descricao: data.com_descricao,
    tipo: data.com_tipo || 'genérico',
    possuiElementos: data.com_possui_elementos || false,
    ativo: data.com_habilitado === true || data.com_habilitado === 1,
  };
};

/**
 * Mapeia dados do frontend para formato esperado pelo backend
 * 
 * @param {Object} dados - Dados do frontend
 * @returns {Object} Dados formatados para backend
 */
const mapearComponenteParaBackend = (dados) => {
  return {
    com_nome: dados.nome,
    com_descricao: dados.descricao || '',
    com_tipo: dados.tipo || 'genérico',
    com_possui_elementos: dados.possuiElementos || false,
    com_habilitado: dados.ativo === true,
  };
};

// ============================================================================
// SERVIÇO DE COMPONENTES
// ============================================================================

const ComponentesServiceBase = criarServicoGenerico(ENDPOINT_COMPONENTES);

/**
 * Serviço para Gerenciar Componentes
 * 
 * Estende o serviço genérico com mapeamento automático de campos
 * entre o formato do frontend e do backend.
 */
const ComponentesService = {
  /**
   * Listar componentes com paginação
   * @param {number} [page=1] - Página
   * @param {number} [limit=10] - Itens por página
   * @param {Object} [filtros={}] - Filtros
   * @returns {Promise<Object>} Resultado com dados mapeados
   */
  listar: async (page = 1, limit = 10, filtros = {}) => {
    const resultado = await ComponentesServiceBase.listar(page, limit, filtros);
    
    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearComponente(resultado.dados),
      };
    }
    
    return resultado;
  },

  /**
   * Obter componente específico
   * @param {string|number} id - ID do componente
   * @returns {Promise<Object>} Componente com dados mapeados
   */
  obter: async (id) => {
    const resultado = await ComponentesServiceBase.obter(id);
    
    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearComponente(resultado.dados),
      };
    }
    
    return resultado;
  },

  /**
   * Criar novo componente
   * @param {Object} dados - Dados do novo componente
   * @returns {Promise<Object>} Resultado da criação
   */
  criar: async (dados) => {
    const dadosBackend = mapearComponenteParaBackend(dados);
    return ComponentesServiceBase.criar(dadosBackend);
  },

  /**
   * Atualizar componente
   * @param {string|number} id - ID do componente
   * @param {Object} dados - Dados atualizados
   * @returns {Promise<Object>} Resultado da atualização
   */
  atualizar: async (id, dados) => {
    const dadosBackend = mapearComponenteParaBackend(dados);
    return ComponentesServiceBase.atualizar(id, dadosBackend);
  },

  /**
   * Deletar componente
   * @param {string|number} id - ID do componente
   * @returns {Promise<Object>} Resultado da exclusão
   */
  deletar: (id) => ComponentesServiceBase.deletar(id),

  /**
   * Buscar componentes
   * @param {string} query - Termo de busca
   * @param {number} [page=1] - Página
   * @param {number} [limit=10] - Itens por página
   * @returns {Promise<Object>} Resultado da busca
   */
  buscar: (query, page = 1, limit = 10) => ComponentesService.listar(page, limit, { search: query }),
};

export default ComponentesService;
