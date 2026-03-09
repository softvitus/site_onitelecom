/**
 * @file Serviço de Gerenciamento de Textos
 * @description Serviço especializado para gerenciar textos.
 * Estende o serviço genérico com mapeamento de campos entre
 * frontend e backend (txt_chave → chave, etc).
 *
 * @module servicos/textos
 */

import criarServicoGenerico from './base';

// ============================================================================
// CONSTANTES
// ============================================================================

const ENDPOINT_TEXTOS = '/textos';

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Mapeia dados do backend (txt_chave, txt_valor, etc)
 * para formato do frontend (chave, valor, etc)
 *
 * @param {Object|Array} data - Dados retornados do backend
 * @returns {Object|Array} Dados mapeados para frontend
 */
const mapearTexto = (data) => {
  if (Array.isArray(data)) {
    return data.map(mapearTexto);
  }

  return {
    id: data.txt_id,
    temaId: data.txt_tem_id,
    categoria: data.txt_categoria,
    chave: data.txt_chave,
    valor: data.txt_valor,
  };
};

/**
 * Mapeia dados do frontend para formato esperado pelo backend
 *
 * @param {Object} dados - Dados do frontend
 * @returns {Object} Dados formatados para backend
 */
const mapearTextoParaBackend = (dados) => {
  return {
    txt_tem_id: dados.temaId,
    txt_categoria: dados.categoria || '',
    txt_chave: dados.chave || '',
    txt_valor: dados.valor || '',
  };
};

// ============================================================================
// SERVIÇO DE TEXTOS
// ============================================================================

const TextosServiceBase = criarServicoGenerico(ENDPOINT_TEXTOS);

/**
 * Serviço para Gerenciar Textos
 *
 * Estende o serviço genérico com mapeamento automático de campos
 * entre o formato do frontend e do backend.
 */
const TextosService = {
  /**
   * Listar textos com paginação
   * @param {number} [page=1] - Página
   * @param {number} [limit=10] - Itens por página
   * @param {Object} [filtros={}] - Filtros
   * @returns {Promise<Object>} Resultado com dados mapeados
   */
  listar: async (page = 1, limit = 10, filtros = {}) => {
    const resultado = await TextosServiceBase.listar(page, limit, filtros);

    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearTexto(resultado.dados),
      };
    }

    return resultado;
  },

  /**
   * Obter um texto por ID
   * @param {string} id - ID do texto
   * @returns {Promise<Object>} Resultado com dados mapeados
   */
  obter: async (id) => {
    const resultado = await TextosServiceBase.obter(id);

    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearTexto(resultado.dados),
      };
    }

    return resultado;
  },

  /**
   * Criar novo texto
   * @param {Object} dados - Dados do texto
   * @returns {Promise<Object>} Resultado da criação
   */
  criar: async (dados) => {
    const dadosFormatados = mapearTextoParaBackend(dados);
    const resultado = await TextosServiceBase.criar(dadosFormatados);

    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearTexto(resultado.dados),
      };
    }

    return resultado;
  },

  /**
   * Atualizar um texto
   * @param {string} id - ID do texto
   * @param {Object} dados - Dados para atualizar
   * @returns {Promise<Object>} Resultado da atualização
   */
  atualizar: async (id, dados) => {
    const dadosFormatados = mapearTextoParaBackend(dados);
    const resultado = await TextosServiceBase.atualizar(id, dadosFormatados);

    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearTexto(resultado.dados),
      };
    }

    return resultado;
  },

  /**
   * Deletar um texto
   * @param {string} id - ID do texto
   * @returns {Promise<Object>} Resultado da deleção
   */
  deletar: async (id) => {
    return await TextosServiceBase.deletar(id);
  },

  /**
   * Buscar textos por critérios
   * @param {Object} criterios - Critérios de busca
   * @returns {Promise<Object>} Lista de textos encontrados
   */
  buscar: async (criterios) => {
    const resultado = await TextosServiceBase.buscar(criterios);

    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearTexto(resultado.dados),
      };
    }

    return resultado;
  },
};

export default TextosService;
