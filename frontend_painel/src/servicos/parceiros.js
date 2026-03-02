/**
 * @file Serviço de Gerenciamento de Parceiros
 * @description Serviço especializado para gerenciar parceiros.
 * Estende o serviço genérico com mapeamento de campos entre
 * frontend e backend (par_nome → nome, etc).
 * 
 * @module servicos/parceiros
 */

import criarServicoGenerico from './base';

// ============================================================================
// CONSTANTES
// ============================================================================

const ENDPOINT_PARCEIROS = '/parceiros';
const RAIO_COBERTURA_PADRAO = 50;

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Mapeia dados do backend (par_nome, par_dominio, etc)
 * para formato do frontend (nome, dominio, etc)
 * 
 * @param {Object|Array} data - Dados retornados do backend
 * @returns {Object|Array} Dados mapeados para frontend
 */
const mapearParceiro = (data) => {
  if (Array.isArray(data)) {
    return data.map(mapearParceiro);
  }

  return {
    id: data.par_id,
    nome: data.par_nome,
    descricao: `${data.par_dominio}`,
    dominio: data.par_dominio,
    cidade: data.par_cidade,
    estado: data.par_estado,
    endereco: data.par_endereco,
    cep: data.par_cep,
    latitude: data.par_latitude,
    longitude: data.par_longitude,
    raioCobertura: data.par_raio_cobertura,
    status: data.par_status,
    ativo: data.par_status === 'ativo',
  };
};

/**
 * Mapeia dados do frontend para formato esperado pelo backend
 * 
 * @param {Object} dados - Dados do frontend
 * @returns {Object} Dados formatados para backend
 */
const mapearParceiroParaBackend = (dados) => {
  return {
    par_nome: dados.nome,
    par_dominio: dados.dominio || '',
    par_cidade: dados.cidade || '',
    par_estado: dados.estado || null,
    par_endereco: dados.endereco || null,
    par_cep: dados.cep || null,
    par_latitude: dados.latitude ? parseFloat(dados.latitude) : null,
    par_longitude: dados.longitude ? parseFloat(dados.longitude) : null,
    par_raio_cobertura: dados.raioCobertura ? parseFloat(dados.raioCobertura) : RAIO_COBERTURA_PADRAO,
    par_status: dados.status || 'ativo',
  };
};

// ============================================================================
// SERVIÇO DE PARCEIROS
// ============================================================================

const ParceirosServiceBase = criarServicoGenerico(ENDPOINT_PARCEIROS);

/**
 * Serviço para Gerenciar Parceiros
 * 
 * Estende o serviço genérico com mapeamento automático de campos
 * entre o formato do frontend e do backend.
 */
const ParceirosService = {
  /**
   * Listar parceiros com paginação
   * @param {number} [page=1] - Página
   * @param {number} [limit=10] - Itens por página
   * @param {Object} [filtros={}] - Filtros
   * @returns {Promise<Object>} Resultado com dados mapeados
   */
  listar: async (page = 1, limit = 10, filtros = {}) => {
    const resultado = await ParceirosServiceBase.listar(page, limit, filtros);
    
    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearParceiro(resultado.dados),
      };
    }
    
    return resultado;
  },

  /**
   * Obter parceiro específico
   * @param {string|number} id - ID do parceiro
   * @returns {Promise<Object>} Parceiro com dados mapeados
   */
  obter: async (id) => {
    const resultado = await ParceirosServiceBase.obter(id);
    
    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearParceiro(resultado.dados),
      };
    }
    
    return resultado;
  },

  /**
   * Criar novo parceiro
   * @param {Object} dados - Dados do novo parceiro
   * @returns {Promise<Object>} Resultado da criação
   */
  criar: async (dados) => {
    const dadosBackend = mapearParceiroParaBackend(dados);
    return ParceirosServiceBase.criar(dadosBackend);
  },

  /**
   * Atualizar parceiro
   * @param {string|number} id - ID do parceiro
   * @param {Object} dados - Dados atualizados
   * @returns {Promise<Object>} Resultado da atualização
   */
  atualizar: async (id, dados) => {
    const dadosBackend = mapearParceiroParaBackend(dados);
    return ParceirosServiceBase.atualizar(id, dadosBackend);
  },

  /**
   * Deletar parceiro
   * @param {string|number} id - ID do parceiro
   * @returns {Promise<Object>} Resultado da exclusão
   */
  deletar: (id) => ParceirosServiceBase.deletar(id),

  /**
   * Buscar parceiros
   * @param {string} query - Termo de busca
   * @param {number} [page=1] - Página
   * @param {number} [limit=10] - Itens por página
   * @returns {Promise<Object>} Resultado da busca
   */
  buscar: (query, page = 1, limit = 10) => ParceirosService.listar(page, limit, { search: query }),
};

export default ParceirosService;
