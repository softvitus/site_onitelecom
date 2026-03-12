/**
 * @file Serviço de Gerenciamento de Relações Página-Componente
 * @description Serviço especializado para gerenciar relações página-componente.
 * Estende o serviço genérico com mapeamento de campos entre
 * frontend e backend (pcr_id → id, pcr_pag_id → paginaId, etc).
 *
 * @module servicos/pagComRels
 */

import criarServicoGenerico from './base';

// ============================================================================
// CONSTANTES
// ============================================================================

const ENDPOINT_PAG_COM_RELS = '/pag-com-rels';

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Mapeia dados do backend (pcr_id, pcr_pag_id, etc)
 * para formato do frontend (id, paginaId, etc)
 *
 * @param {Object|Array} data - Dados retornados do backend
 * @returns {Object|Array} Dados mapeados para frontend
 */
const mapearRelacao = (data) => {
  if (Array.isArray(data)) {
    return data.map(mapearRelacao);
  }

  return {
    id: data.pcr_id,
    paginaId: data.pcr_pag_id,
    componenteId: data.pcr_com_id,
    ordem: data.pcr_ordem,
    habilitado: data.pcr_habilitado === true || data.pcr_habilitado === 1,
    componenteNome: data.Componente?.com_nome || null,
    componenteDescricao: data.Componente?.com_descricao || null,
  };
};

/**
 * Mapeia dados do frontend para formato esperado pelo backend
 *
 * @param {Object} dados - Dados do frontend
 * @returns {Object} Dados formatados para backend
 */
const mapearRelacaoParaBackend = (dados) => {
  const mapped = {};
  if (dados.paginaId !== undefined) mapped.pcr_pag_id = dados.paginaId;
  if (dados.componenteId !== undefined) mapped.pcr_com_id = dados.componenteId;
  if (dados.ordem !== undefined) mapped.pcr_ordem = dados.ordem;
  if (dados.habilitado !== undefined) mapped.pcr_habilitado = dados.habilitado;
  return mapped;
};

// ============================================================================
// SERVIÇO DE RELAÇÕES PÁGINA-COMPONENTE
// ============================================================================

const PagComRelsServiceBase = criarServicoGenerico(ENDPOINT_PAG_COM_RELS);

/**
 * Serviço para Gerenciar Relações Página-Componente
 */
const PagComRelsService = {
  /**
   * Listar relações de uma página específica
   * @param {string} paginaId - ID da página
   * @returns {Promise<Object>} Resultado com dados mapeados
   */
  listarPorPagina: async (paginaId) => {
    const resultado = await PagComRelsServiceBase.listar(1, 100, { pcr_pag_id: paginaId });

    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearRelacao(resultado.dados),
      };
    }

    return resultado;
  },

  /**
   * Criar nova relação
   * @param {Object} dados - Dados da relação
   * @returns {Promise<Object>} Resultado da criação
   */
  criar: async (dados) => {
    const dadosBackend = mapearRelacaoParaBackend(dados);
    return PagComRelsServiceBase.criar(dadosBackend);
  },

  /**
   * Atualizar relação (ordem, habilitado)
   * @param {string} id - ID da relação
   * @param {Object} dados - Dados atualizados
   * @returns {Promise<Object>} Resultado da atualização
   */
  atualizar: async (id, dados) => {
    const dadosBackend = mapearRelacaoParaBackend(dados);
    return PagComRelsServiceBase.atualizar(id, dadosBackend);
  },

  /**
   * Deletar relação
   * @param {string} id - ID da relação
   * @returns {Promise<Object>} Resultado da exclusão
   */
  deletar: (id) => PagComRelsServiceBase.deletar(id),
};

export default PagComRelsService;
