/**
 * ============================================================================
 * API - Configuração Base e Cliente HTTP
 * ============================================================================
 * @module servicos/api
 * @description Centraliza configurações de URL base e métodos HTTP.
 *              Fornece wrapper para fetch com tratamento de erros padronizado.
 *
 * @requires REACT_APP_API_URL - Variável de ambiente com URL da API
 *
 * @example
 * // Configurar em .env
 * REACT_APP_API_URL=http://localhost:5000/api/v1
 *
 * @example
 * // Importar e usar
 * import { get, post, put, del } from './api';
 *
 * const dados = await get('/public/parceiros');
 * await post('/auth/login', { email, senha });
 */

// ============================================================================
// CONSTANTES
// ============================================================================

/** @constant {string} API_BASE_URL - URL base da API */
const API_BASE_URL = process.env.REACT_APP_API_URL;

/** @constant {Object} DEFAULT_HEADERS - Headers padrão para requisições */
const DEFAULT_HEADERS = Object.freeze({
  'Content-Type': 'application/json',
});

// ============================================================================
// CLIENTE HTTP
// ============================================================================

/**
 * Wrapper para requisições fetch com configurações padrão
 * @private
 * @param {string} endpoint - Endpoint da API (ex: '/public/parceiros')
 * @param {RequestInit} [options={}] - Opções do fetch
 * @returns {Promise<Object>} Resposta JSON da API
 * @throws {ApiError} Erro com status, message e data
 */
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const err = new Error(error.error?.message || `Erro ${response.status}`);
      err.status = response.status;
      err.data = error;
      throw err;
    }

    return await response.json();
  } catch (error) {
    // Re-throw se já é um erro formatado
    if (error instanceof Error && error.status) throw error;

    // Erro de rede ou outro
    const err = new Error(error.message || 'Erro de conexão');
    err.status = 0;
    err.data = null;
    throw err;
  }
};

// ============================================================================
// MÉTODOS HTTP
// ============================================================================

/**
 * GET - Buscar dados
 * @param {string} endpoint - Endpoint da API
 * @param {RequestInit} [options={}] - Opções adicionais
 * @returns {Promise<Object>} Resposta JSON
 *
 * @example
 * const parceiros = await get('/public/parceiros');
 */
export const get = (endpoint, options = {}) => {
  return request(endpoint, {
    method: 'GET',
    ...options,
  });
};

/**
 * POST - Criar dados
 * @param {string} endpoint - Endpoint da API
 * @param {Object} data - Dados a enviar
 * @param {RequestInit} [options={}] - Opções adicionais
 * @returns {Promise<Object>} Resposta JSON
 *
 * @example
 * const user = await post('/auth/register', { email, senha });
 */
export const post = (endpoint, data, options = {}) => {
  return request(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
};

/**
 * PUT - Atualizar dados
 * @param {string} endpoint - Endpoint da API
 * @param {Object} data - Dados a atualizar
 * @param {RequestInit} [options={}] - Opções adicionais
 * @returns {Promise<Object>} Resposta JSON
 *
 * @example
 * const user = await put('/users/1', { nome: 'Novo Nome' });
 */
export const put = (endpoint, data, options = {}) => {
  return request(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });
};

/**
 * DELETE - Deletar dados
 * @param {string} endpoint - Endpoint da API
 * @param {RequestInit} [options={}] - Opções adicionais
 * @returns {Promise<Object>} Resposta JSON
 *
 * @example
 * await del('/users/1');
 */
export const del = (endpoint, options = {}) => {
  return request(endpoint, {
    method: 'DELETE',
    ...options,
  });
};

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Adicionar token JWT ao header
 * @param {string} token - Token JWT
 * @returns {Object} Objeto com header Authorization
 *
 * @example
 * const dados = await get('/private/perfil', withAuth(token));
 */
export const withAuth = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// ============================================================================
// VERIFICAÇÃO DE SAÚDE DA API
// ============================================================================

/**
 * Erros que indicam falha de conexão com a API
 * @constant {Array<string>}
 */
const CONNECTION_ERRORS = Object.freeze([
  'Failed to fetch',
  'NetworkError',
  'Network request failed',
  'net::ERR_CONNECTION_REFUSED',
  'net::ERR_CONNECTION_RESET',
  'net::ERR_NAME_NOT_RESOLVED',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'fetch failed',
]);

/**
 * Verifica se um erro é de conexão/rede
 * @param {Error|Object} error - Erro a verificar
 * @returns {boolean} True se for erro de conexão
 */
export const isConnectionError = (error) => {
  const errorMessage = error?.message || error?.toString() || '';
  return CONNECTION_ERRORS.some(msg => 
    errorMessage.toLowerCase().includes(msg.toLowerCase())
  );
};

/**
 * Verifica se a API está acessível
 * @async
 * @param {number} [timeout=5000] - Timeout em ms
 * @returns {Promise<boolean>} True se API está acessível
 * @throws {Error} Lança erro se API não estiver acessível
 *
 * @example
 * try {
 *   await checkApiHealth();
 *   console.log('API online');
 * } catch (error) {
 *   console.error('API offline');
 * }
 */
export const checkApiHealth = async (timeout = 5000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    await fetch(`${API_BASE_URL}/public/parceiros`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Qualquer resposta (mesmo 4xx/5xx) significa que a API está respondendo
    return true;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Erro de timeout ou conexão
    const errorMessage = error.name === 'AbortError' 
      ? 'API timeout' 
      : error.message || 'Failed to fetch';
    
    throw new Error(errorMessage);
  }
};

// ============================================================================
// TIPOS (JSDoc)
// ============================================================================

/**
 * @typedef {Object} ApiError
 * @property {number} status - Código HTTP do erro
 * @property {string} message - Mensagem de erro
 * @property {Object|null} data - Dados adicionais do erro
 */

// ============================================================================
// EXPORTS
// ============================================================================

const apiService = {
  API_BASE_URL,
  get,
  post,
  put,
  del,
  withAuth,
  checkApiHealth,
  isConnectionError,
};

export default apiService;

export { API_BASE_URL, DEFAULT_HEADERS };
