/**
 * @file Serviço de Gerenciamento de Features
 * @description Serviço especializado para gerenciar features.
 * Estende o serviço genérico com mapeamento de campos entre
 * frontend e backend (fea_nome → nome, etc).
 * 
 * @module servicos/features
 */

import criarServicoGenerico from './base';

// ============================================================================
// CONSTANTES
// ============================================================================

const ENDPOINT_FEATURES = '/features';

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Mapeia dados do backend (fea_nome, fea_habilitado, etc)
 * para formato do frontend (nome, habilitado, etc)
 * 
 * @param {Object|Array} data - Dados retornados do backend
 * @returns {Object|Array} Dados mapeados para frontend
 */
const mapearFeature = (data) => {
  if (Array.isArray(data)) {
    return data.map(mapearFeature);
  }

  return {
    id: data.fea_id,
    temaId: data.fea_tem_id,
    nome: data.fea_nome,
    habilitado: data.fea_habilitado,
  };
};

/**
 * Mapeia dados do frontend para formato esperado pelo backend
 * 
 * @param {Object} dados - Dados do frontend
 * @returns {Object} Dados formatados para backend
 */
const mapearFeatureParaBackend = (dados) => {
  return {
    fea_tem_id: dados.temaId,
    fea_nome: dados.nome || '',
    fea_habilitado: dados.habilitado !== false,
  };
};

// ============================================================================
// SERVIÇO DE FEATURES
// ============================================================================

const FeaturesServiceBase = criarServicoGenerico(ENDPOINT_FEATURES);

/**
 * Serviço para Gerenciar Features
 * 
 * Estende o serviço genérico com mapeamento automático de campos
 * entre o formato do frontend e do backend.
 */
const FeaturesService = {
  /**
   * Listar features com paginação
   * @param {number} [page=1] - Página
   * @param {number} [limit=10] - Itens por página
   * @param {Object} [filtros={}] - Filtros
   * @returns {Promise<Object>} Resultado com dados mapeados
   */
  listar: async (page = 1, limit = 10, filtros = {}) => {
    const resultado = await FeaturesServiceBase.listar(page, limit, filtros);
    
    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearFeature(resultado.dados),
      };
    }
    
    return resultado;
  },

  /**
   * Obter uma feature por ID
   * @param {string} id - ID da feature
   * @returns {Promise<Object>} Resultado com dados mapeados
   */
  obter: async (id) => {
    const resultado = await FeaturesServiceBase.obter(id);
    
    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearFeature(resultado.dados),
      };
    }
    
    return resultado;
  },

  /**
   * Criar nova feature
   * @param {Object} dados - Dados da feature
   * @returns {Promise<Object>} Resultado da criação
   */
  criar: async (dados) => {
    const dadosFormatados = mapearFeatureParaBackend(dados);
    const resultado = await FeaturesServiceBase.criar(dadosFormatados);
    
    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearFeature(resultado.dados),
      };
    }
    
    return resultado;
  },

  /**
   * Atualizar uma feature
   * @param {string} id - ID da feature
   * @param {Object} dados - Dados para atualizar
   * @returns {Promise<Object>} Resultado da atualização
   */
  atualizar: async (id, dados) => {
    const dadosFormatados = mapearFeatureParaBackend(dados);
    const resultado = await FeaturesServiceBase.atualizar(id, dadosFormatados);
    
    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearFeature(resultado.dados),
      };
    }
    
    return resultado;
  },

  /**
   * Deletar uma feature
   * @param {string} id - ID da feature
   * @returns {Promise<Object>} Resultado da deleção
   */
  deletar: async (id) => {
    return await FeaturesServiceBase.deletar(id);
  },

  /**
   * Buscar features por critérios
   * @param {Object} criterios - Critérios de busca
   * @returns {Promise<Object>} Lista de features encontradas
   */
  buscar: async (criterios) => {
    const resultado = await FeaturesServiceBase.buscar(criterios);
    
    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearFeature(resultado.dados),
      };
    }
    
    return resultado;
  },
};

export default FeaturesService;
