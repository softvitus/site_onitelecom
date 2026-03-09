/**
 * @file Serviço de Gerenciamento de Conteúdo
 * @description Serviço especializado para gerenciar conteúdo.
 * Estende o serviço genérico com mapeamento de campos entre
 * frontend e backend (cnt_tipo → tipo, etc).
 *
 * @module servicos/conteudo
 */

import criarServicoGenerico from './base';

// ============================================================================
// CONSTANTES
// ============================================================================

const ENDPOINT_CONTEUDO = '/conteudos';

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Mapeia dados do backend (cnt_tipo, cnt_categoria, etc)
 * para formato do frontend (tipo, categoria, etc)
 *
 * @param {Object|Array} data - Dados retornados do backend
 * @returns {Object|Array} Dados mapeados para frontend
 */
const mapearConteudo = (data) => {
  if (Array.isArray(data)) {
    return data.map(mapearConteudo);
  }

  return {
    id: data.cnt_id,
    temaId: data.cnt_tem_id,
    tipo: data.cnt_tipo,
    categoria: data.cnt_categoria,
    titulo: data.cnt_titulo,
    descricao: data.cnt_descricao,
    dados: data.cnt_dados,
    ordem: data.cnt_ordem,
    habilitado: data.cnt_habilitado,
  };
};

/**
 * Mapeia dados do frontend para formato esperado pelo backend
 *
 * @param {Object} dados - Dados do frontend
 * @returns {Object} Dados formatados para backend
 */
const mapearConteudoParaBackend = (dados) => {
  return {
    cnt_tem_id: dados.temaId,
    cnt_tipo: dados.tipo || '',
    cnt_categoria: dados.categoria || '',
    cnt_titulo: dados.titulo || null,
    cnt_descricao: dados.descricao || null,
    cnt_dados: dados.dados || null,
    cnt_ordem: dados.ordem || null,
    cnt_habilitado: dados.habilitado !== false,
  };
};

// ============================================================================
// SERVIÇO DE CONTEÚDO
// ============================================================================

const ConteudoServiceBase = criarServicoGenerico(ENDPOINT_CONTEUDO);

/**
 * Serviço para Gerenciar Conteúdo
 *
 * Estende o serviço genérico com mapeamento automático de campos
 * entre o formato do frontend e do backend.
 */
const ConteudoService = {
  /**
   * Listar conteúdos com paginação
   * @param {number} [page=1] - Página
   * @param {number} [limit=10] - Itens por página
   * @param {Object} [filtros={}] - Filtros
   * @returns {Promise<Object>} Resultado com dados mapeados
   */
  listar: async (page = 1, limit = 10, filtros = {}) => {
    const resultado = await ConteudoServiceBase.listar(page, limit, filtros);

    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearConteudo(resultado.dados),
      };
    }

    return resultado;
  },

  /**
   * Obter um conteúdo por ID
   * @param {string} id - ID do conteúdo
   * @returns {Promise<Object>} Resultado com dados mapeados
   */
  obter: async (id) => {
    const resultado = await ConteudoServiceBase.obter(id);

    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearConteudo(resultado.dados),
      };
    }

    return resultado;
  },

  /**
   * Criar novo conteúdo
   * @param {Object} dados - Dados do conteúdo
   * @returns {Promise<Object>} Resultado da criação
   */
  criar: async (dados) => {
    const dadosFormatados = mapearConteudoParaBackend(dados);
    const resultado = await ConteudoServiceBase.criar(dadosFormatados);

    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearConteudo(resultado.dados),
      };
    }

    return resultado;
  },

  /**
   * Atualizar um conteúdo
   * @param {string} id - ID do conteúdo
   * @param {Object} dados - Dados para atualizar
   * @returns {Promise<Object>} Resultado da atualização
   */
  atualizar: async (id, dados) => {
    const dadosFormatados = mapearConteudoParaBackend(dados);
    const resultado = await ConteudoServiceBase.atualizar(id, dadosFormatados);

    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearConteudo(resultado.dados),
      };
    }

    return resultado;
  },

  /**
   * Deletar um conteúdo
   * @param {string} id - ID do conteúdo
   * @returns {Promise<Object>} Resultado da deleção
   */
  deletar: async (id) => {
    return await ConteudoServiceBase.deletar(id);
  },

  /**
   * Buscar conteúdos por critérios
   * @param {Object} criterios - Critérios de busca
   * @returns {Promise<Object>} Lista de conteúdos encontrados
   */
  buscar: async (criterios) => {
    const resultado = await ConteudoServiceBase.buscar(criterios);

    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearConteudo(resultado.dados),
      };
    }

    return resultado;
  },
};

export default ConteudoService;
