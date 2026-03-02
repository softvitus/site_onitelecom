/**
 * @file Configuração do Cliente HTTP Axios
 * @description Instância configurada de Axios com interceptors para
 * autenticação JWT, renovação automática de token e tratamento de erros
 * 
 * @module servicos/api
 */

import axios from 'axios';

// ============================================================================
// CONSTANTES
// ============================================================================

const API_CHAVES = {
  BASE_URL: 'VITE_API_URL',
  TIMEOUT: 'VITE_API_TIMEOUT',
  DEBUG: 'VITE_DEBUG',
};

const TIMEOUT_PADRAO = 10000;
const ROTA_LOGIN = '/login';
const HEADERS_PADRAO = {
  'Content-Type': 'application/json',
};

const MENSAGENS_LOG = {
  REQUEST: (method, url) => `[REQUEST] ${method.toUpperCase()} ${url}`,
  SUCCESS: (status, url) => `[SUCCESS] ${status} ${url}`,
  ERROR: (status, error) => `[ERROR] Erro ${status}: ${error}`,
  TOKEN_EXPIRADO: '[ERROR] Token expirado e falha ao renovar',
};

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

/**
 * Instância Axios configurada com baseURL, timeout e headers padrão
 */
const api = axios.create({
  baseURL: import.meta.env[API_CHAVES.BASE_URL],
  timeout: parseInt(import.meta.env[API_CHAVES.TIMEOUT]) || TIMEOUT_PADRAO,
  headers: HEADERS_PADRAO,
});

// ============================================================================
// INTERCEPTOR DE REQUISIÇÃO
// ============================================================================

/**
 * Interceptor de requisição que:
 * - Adiciona token JWT automaticamente em todas as requisições
 * - Registra requisições em modo debug
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env[API_CHAVES.DEBUG] === 'true') {
      console.log(MENSAGENS_LOG.REQUEST(config.method, config.url));
    }

    return config;
  },
  (error) => {
    console.error('[ERROR] Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// ============================================================================
// INTERCEPTOR DE RESPOSTA
// ============================================================================

/**
 * Interceptor de resposta que:
 * - Registra respostas bem-sucedidas em modo debug
 * - Trata erros 401 (token expirado) com renovação automática
 * - Redireciona para login se token não puder ser renovado
 */
api.interceptors.response.use(
  (response) => {
    if (import.meta.env[API_CHAVES.DEBUG] === 'true') {
      console.log(MENSAGENS_LOG.SUCCESS(response.status, response.config.url));
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Tratar erro 401 (Token expirado)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tentar renovar token
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
          }
        );

        const { token } = refreshResponse.data.data;

        // Salvar novo token
        localStorage.setItem('authToken', token);

        // Atualizar header da requisição original
        originalRequest.headers.Authorization = `Bearer ${token}`;

        // Tentar requisição novamente
        return api(originalRequest);
      } catch (refreshError) {
        console.error(MENSAGENS_LOG.TOKEN_EXPIRADO);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('permissoes');
        window.location.href = ROTA_LOGIN;
        return Promise.reject(refreshError);
      }
    }

    if (import.meta.env[API_CHAVES.DEBUG] === 'true') {
      console.error(
        MENSAGENS_LOG.ERROR(
          error.response?.status,
          error.response?.data?.error || error.message
        )
      );
    }

    return Promise.reject(error);
  }
);

export default api;
