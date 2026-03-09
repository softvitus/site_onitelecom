/**
 * @file Serviço de Gerenciamento de Páginas
 * @description Serviço especializado para gerenciar páginas.
 * Estende o serviço genérico com mapeamento de campos entre
 * frontend e backend (pag_nome → nome, etc).
 *
 * @module servicos/paginas
 */

import criarServicoGenerico from './base';

// ============================================================================
// CONSTANTES
// ============================================================================

const ENDPOINT_PAGINAS = '/paginas';

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Mapeia dados do backend (pag_nome, pag_par_id, etc)
 * para formato do frontend (nome, parceiroId, etc)
 *
 * @param {Object|Array} data - Dados retornados do backend
 * @returns {Object|Array} Dados mapeados para frontend
 */
const mapearPagina = (data) => {
  if (Array.isArray(data)) {
    return data.map(mapearPagina);
  }

  return {
    id: data.pag_id,
    nome: data.pag_nome,
    caminho: data.pag_caminho,
    titulo: data.pag_titulo,
    parceiroId: data.pag_par_id,
    temaId: data.pag_tem_id,
    status: data.pag_status,
    mostrarNoMenu: data.pag_mostrar_no_menu,
    etiquetaMenu: data.pag_etiqueta_menu,
    ordemMenu: data.pag_ordem_menu,
    icone: data.pag_icone,
    categoria: data.pag_categoria,
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
const mapearPaginaParaBackend = (dados) => {
  return {
    pag_nome: dados.nome,
    pag_caminho: dados.caminho,
    pag_titulo: dados.titulo,
    pag_par_id: dados.parceiroId || null,
    pag_tem_id: dados.temaId || null,
    pag_status: dados.status || 'ativo',
    pag_mostrar_no_menu: dados.mostrarNoMenu || false,
    pag_etiqueta_menu: dados.etiquetaMenu || null,
    pag_ordem_menu: dados.ordemMenu || null,
    pag_icone: dados.icone || null,
    pag_categoria: dados.categoria || null,
  };
};

// ============================================================================
// SERVIÇO DE PÁGINAS
// ============================================================================

const PaginasServiceBase = criarServicoGenerico(ENDPOINT_PAGINAS);

/**
 * Serviço para Gerenciar Páginas
 *
 * Estende o serviço genérico com mapeamento automático de campos
 * entre o formato do frontend e do backend.
 */
const PaginasService = {
  /**
   * Listar páginas com paginação
   * @param {number} [page=1] - Página
   * @param {number} [limit=10] - Itens por página
   * @param {Object} [filtros={}] - Filtros
   * @returns {Promise<Object>} Resultado com dados mapeados
   */
  listar: async (page = 1, limit = 10, filtros = {}) => {
    const resultado = await PaginasServiceBase.listar(page, limit, filtros);

    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearPagina(resultado.dados),
      };
    }

    return resultado;
  },

  /**
   * Obter página específica
   * @param {string|number} id - ID da página
   * @returns {Promise<Object>} Página com dados mapeados
   */
  obter: async (id) => {
    const resultado = await PaginasServiceBase.obter(id);

    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearPagina(resultado.dados),
      };
    }

    return resultado;
  },

  /**
   * Criar nova página
   * @param {Object} dados - Dados da nova página
   * @returns {Promise<Object>} Resultado da criação
   */
  criar: async (dados) => {
    const dadosBackend = mapearPaginaParaBackend(dados);
    return PaginasServiceBase.criar(dadosBackend);
  },

  /**
   * Atualizar página
   * @param {string|number} id - ID da página
   * @param {Object} dados - Dados atualizados
   * @returns {Promise<Object>} Resultado da atualização
   */
  atualizar: async (id, dados) => {
    const dadosBackend = mapearPaginaParaBackend(dados);
    return PaginasServiceBase.atualizar(id, dadosBackend);
  },

  /**
   * Deletar página
   * @param {string|number} id - ID da página
   * @returns {Promise<Object>} Resultado da exclusão
   */
  deletar: (id) => PaginasServiceBase.deletar(id),

  /**
   * Buscar páginas
   * @param {string} query - Termo de busca
   * @param {number} [page=1] - Página
   * @param {number} [limit=10] - Itens por página
   * @returns {Promise<Object>} Resultado da busca
   */
  buscar: (query, page = 1, limit = 10) => PaginasService.listar(page, limit, { search: query }),
};

export default PaginasService;
