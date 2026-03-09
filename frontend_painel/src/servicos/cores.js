/**
 * @file Serviço de Gerenciamento de Cores
 * @description Serviço especializado para gerenciar cores.
 * Estende o serviço genérico com mapeamento de campos entre
 * frontend e backend (cor_nome → nome, etc).
 *
 * @module servicos/cores
 */

import criarServicoGenerico from './base';

// ============================================================================
// CONSTANTES
// ============================================================================

const ENDPOINT_CORES = '/cores';

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Mapeia dados do backend (cor_nome, cor_valor, etc)
 * para formato do frontend (nome, valor, etc)
 *
 * @param {Object|Array} data - Dados retornados do backend
 * @returns {Object|Array} Dados mapeados para frontend
 */
const mapearCor = (data) => {
  if (Array.isArray(data)) {
    return data.map(mapearCor);
  }

  return {
    id: data.cor_id,
    temaId: data.cor_tem_id,
    nome: data.cor_nome,
    valor: data.cor_valor,
    categoria: data.cor_categoria,
    componente: data.cor_componente,
    variavelRef: data.cor_variavel_ref,
    descricao: data.cor_descricao,
    ativo: data.cor_ativo !== undefined ? data.cor_ativo : true,
  };
};

/**
 * Mapeia dados do frontend para formato esperado pelo backend
 *
 * @param {Object} dados - Dados do frontend
 * @returns {Object} Dados formatados para backend
 */
const mapearCorParaBackend = (dados) => {
  return {
    cor_tem_id: dados.temaId,
    cor_nome: dados.nome || '',
    cor_valor: dados.valor || '',
    cor_categoria: dados.categoria || '',
    cor_componente: dados.componente || '',
    cor_variavel_ref: dados.variavelRef || '',
    cor_descricao: dados.descricao || '',
    cor_ativo: dados.ativo !== undefined ? dados.ativo : true,
  };
};

// ============================================================================
// SERVIÇO DE CORES
// ============================================================================

const CoresServiceBase = criarServicoGenerico(ENDPOINT_CORES);

/**
 * Serviço para Gerenciar Cores
 *
 * Estende o serviço genérico com mapeamento automático de campos
 * entre o formato do frontend e do backend.
 */
const CoresService = {
  /**
   * Listar cores com paginação
   * @param {number} [page=1] - Página
   * @param {number} [limit=10] - Itens por página
   * @param {Object} [filtros={}] - Filtros
   * @returns {Promise<Object>} Resultado com dados mapeados
   */
  listar: async (page = 1, limit = 10, filtros = {}) => {
    const resultado = await CoresServiceBase.listar(page, limit, filtros);

    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearCor(resultado.dados),
      };
    }

    return resultado;
  },

  /**
   * Obter uma cor por ID
   * @param {string} id - ID da cor
   * @returns {Promise<Object>} Resultado com dados mapeados
   */
  obter: async (id) => {
    const resultado = await CoresServiceBase.obter(id);

    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearCor(resultado.dados),
      };
    }

    return resultado;
  },

  /**
   * Criar nova cor
   * @param {Object} dados - Dados da cor
   * @returns {Promise<Object>} Resultado da criação
   */
  criar: async (dados) => {
    const dadosFormatados = mapearCorParaBackend(dados);
    const resultado = await CoresServiceBase.criar(dadosFormatados);

    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearCor(resultado.dados),
      };
    }

    return resultado;
  },

  /**
   * Atualizar uma cor
   * @param {string} id - ID da cor
   * @param {Object} dados - Dados para atualizar
   * @returns {Promise<Object>} Resultado da atualização
   */
  atualizar: async (id, dados) => {
    const dadosFormatados = mapearCorParaBackend(dados);
    const resultado = await CoresServiceBase.atualizar(id, dadosFormatados);

    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearCor(resultado.dados),
      };
    }

    return resultado;
  },

  /**
   * Deletar uma cor
   * @param {string} id - ID da cor
   * @returns {Promise<Object>} Resultado da deleção
   */
  deletar: async (id) => {
    return await CoresServiceBase.deletar(id);
  },

  /**
   * Buscar cores por critérios
   * @param {Object} criterios - Critérios de busca
   * @returns {Promise<Object>} Lista de cores encontradas
   */
  buscar: async (criterios) => {
    const resultado = await CoresServiceBase.buscar(criterios);

    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearCor(resultado.dados),
      };
    }

    return resultado;
  },

  /**
   * Listar cores por componente
   * @param {string} componente - Nome do componente
   * @param {number} [page=1] - Página
   * @param {number} [limit=10] - Itens por página
   * @returns {Promise<Object>} Resultado com dados mapeados
   */
  listarPorComponente: async (componente, page = 1, limit = 10) => {
    const resultado = await CoresServiceBase.obter(
      `/componente/${componente}?page=${page}&limit=${limit}`
    );
    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearCor(resultado.dados),
      };
    }
    return resultado;
  },

  /**
   * Listar cores por categoria
   * @param {string} categoria - Categoria
   * @param {number} [page=1] - Página
   * @param {number} [limit=10] - Itens por página
   * @returns {Promise<Object>} Resultado com dados mapeados
   */
  listarPorCategoria: async (categoria, page = 1, limit = 10) => {
    const resultado = await CoresServiceBase.obter(
      `/categoria/${categoria}?page=${page}&limit=${limit}`
    );
    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearCor(resultado.dados),
      };
    }
    return resultado;
  },

  /**
   * Listar apenas cores ativas
   * @param {string} temaId - ID do tema
   * @param {number} [page=1] - Página
   * @param {number} [limit=10] - Itens por página
   * @returns {Promise<Object>} Resultado com dados mapeados
   */
  listarAtivas: async (temaId, page = 1, limit = 10) => {
    const resultado = await CoresServiceBase.obter(`/ativas/${temaId}?page=${page}&limit=${limit}`);
    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearCor(resultado.dados),
      };
    }
    return resultado;
  },

  /**
   * Listar cores ativas por componente
   * @param {string} componente - Nome do componente
   * @param {number} [page=1] - Página
   * @param {number} [limit=10] - Itens por página
   * @returns {Promise<Object>} Resultado com dados mapeados
   */
  listarAtivasPorComponente: async (componente, page = 1, limit = 10) => {
    const resultado = await CoresServiceBase.obter(
      `/componente/${componente}/ativas?page=${page}&limit=${limit}`
    );
    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearCor(resultado.dados),
      };
    }
    return resultado;
  },

  /**
   * Exportar paleta de cores
   * @param {string} temaId - ID do tema
   * @returns {Promise<Object>} Paleta exportada em JSON
   */
  exportarPaleta: async (temaId) => {
    return await CoresServiceBase.obter(`/exportar/${temaId}`);
  },

  /**
   * Importar paleta de cores
   * @param {string} temaId - ID do tema
   * @param {Array} cores - Array de cores a importar
   * @returns {Promise<Object>} Resultado da importação
   */
  importarPaleta: async (temaId, cores) => {
    return await CoresServiceBase.criar(
      {
        temaId,
        cores,
      },
      '/importar'
    );
  },
};

export default CoresService;
