/**
 * ============================================================================
 * Parceiro - Serviço de Gerenciamento de Parceiros
 * ============================================================================
 * @module servicos/parceiro
 * @description Serviço para buscar e gerenciar parceiros via API pública.
 *              Não requer autenticação.
 *
 * @example
 * import { buscarTodosParceiros } from './parceiro';
 *
 * const { success, data } = await buscarTodosParceiros();
 * if (success) {
 *   data.forEach(parceiro => console.log(parceiro.nome));
 * }
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { get } from './api';

// ============================================================================
// CONSTANTES
// ============================================================================

/** @constant {string} ENDPOINT_PARCEIROS - Endpoint da API de parceiros */
const ENDPOINT_PARCEIROS = '/public/parceiros';

/** @constant {number} DEFAULT_PAGE - Página padrão */
const DEFAULT_PAGE = 1;

/** @constant {number} DEFAULT_LIMIT - Limite padrão por página */
const DEFAULT_LIMIT = 100;

// ============================================================================
// SERVIÇOS
// ============================================================================

/**
 * Buscar todos os parceiros ativos
 * @async
 * @param {number} [page=1] - Número da página
 * @param {number} [limit=100] - Itens por página
 * @returns {Promise<ParceiroResponse>} Resposta com lista de parceiros
 *
 * @example
 * // Buscar primeira página
 * const { success, data } = await buscarTodosParceiros();
 *
 * @example
 * // Buscar com paginação
 * const { data, pagination } = await buscarTodosParceiros(2, 50);
 */
export const buscarTodosParceiros = async (page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) => {
  try {
    const endpoint = `${ENDPOINT_PARCEIROS}?page=${page}&limit=${limit}`;
    const response = await get(endpoint);

    if (response.success && Array.isArray(response.data)) {
      return response;
    }

    return createEmptyResponse();
  } catch (error) {
    return createEmptyResponse();
  }
};

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Cria resposta vazia padrão
 * @private
 * @returns {ParceiroResponse}
 */
const createEmptyResponse = () => ({
  success: false,
  data: [],
  pagination: {},
});

// ============================================================================
// TIPOS (JSDoc)
// ============================================================================

/**
 * @typedef {Object} Parceiro
 * @property {number} id - ID do parceiro
 * @property {string} nome - Nome do parceiro
 * @property {string} dominio - Domínio do parceiro
 * @property {boolean} ativo - Se está ativo
 */

/**
 * @typedef {Object} ParceiroResponse
 * @property {boolean} success - Se a requisição foi bem sucedida
 * @property {Parceiro[]} data - Lista de parceiros
 * @property {Object} pagination - Dados de paginação
 */

// ============================================================================
// EXPORTS
// ============================================================================

const parceiroService = {
  buscarTodosParceiros,
};

export default parceiroService;

export { ENDPOINT_PARCEIROS, DEFAULT_PAGE, DEFAULT_LIMIT };
