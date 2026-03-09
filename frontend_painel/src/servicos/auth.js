/**
 * @file Serviço de Autenticação
 * @description Gerencia autenticação, autorização e tokens JWT.
 * Fornece funções para login, logout, renovação de token, permissões
 * e alteração de senha.
 *
 * @module servicos/auth
 */

import api from './api';

// ============================================================================
// CONSTANTES
// ============================================================================

const LOCALSTORAGE_CHAVES = {
  TOKEN: 'authToken',
  USUARIO: 'user',
  PERMISSOES: 'permissoes',
};

const ENDPOINTS_AUTH = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  USUARIO_ATUAL: '/auth/me',
  PERMISSOES: '/auth/me/permissoes',
  RENOVAR_TOKEN: '/auth/refresh',
  VERIFICAR_TOKEN: '/auth/verify',
  ALTERAR_SENHA: '/auth/change-password',
};

const MENSAGENS_ERRO = {
  LOGIN_FALHOU: 'Erro ao fazer login',
  LOGOUT_ERRO: 'Erro ao fazer logout',
  USUARIO_ERRO: 'Erro ao obter usuário',
  PERMISSOES_ERRO: 'Erro ao obter permissões',
  RENOVAR_TOKEN_ERRO: 'Erro ao renovar token',
  ALTERAR_SENHA_ERRO: 'Erro ao alterar senha',
};

// ============================================================================
// SERVIÇO DE AUTENTICAÇÃO
// ============================================================================

/**
 * Serviço de Autenticação
 *
 * Gerencia autenticação de usuários, tokens JWT, permissões e
 * operações relacionadas à conta de usuário.
 */
export const authService = {
  /**
   * Fazer login
   * @param {string} email - Email do usuário
   * @param {string} senha - Senha do usuário
   * @returns {Promise<Object>} { sucesso, token, usuario, erro }
   */
  login: async (email, senha) => {
    try {
      const response = await api.post('/auth/login', { email, senha });

      if (response.data.success) {
        const { token, usuario } = response.data.data;

        // Salvar token e dados do usuário
        localStorage.setItem(LOCALSTORAGE_CHAVES.TOKEN, token);
        localStorage.setItem(LOCALSTORAGE_CHAVES.USUARIO, JSON.stringify(usuario));

        return {
          sucesso: true,
          token,
          usuario,
          erro: null,
        };
      }

      return {
        sucesso: false,
        erro: response.data.error || MENSAGENS_ERRO.LOGIN_FALHOU,
      };
    } catch (error) {
      return {
        sucesso: false,
        erro: error.response?.data?.error || error.message || MENSAGENS_ERRO.LOGIN_FALHOU,
      };
    }
  },

  /**
   * Fazer logout
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignora erro ao fazer logout
    } finally {
      localStorage.removeItem(LOCALSTORAGE_CHAVES.TOKEN);
      localStorage.removeItem(LOCALSTORAGE_CHAVES.USUARIO);
      localStorage.removeItem(LOCALSTORAGE_CHAVES.PERMISSOES);
    }
  },

  /**
   * Obter dados do usuário autenticado
   * @returns {Promise<Object|null>} Dados do usuário ou null se erro
   */
  obterUsuarioAtual: async () => {
    try {
      const response = await api.get('/auth/me');

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      return null;
    }
  },

  /**
   * Obter permissões do usuário
   * @returns {Promise<Array>} Lista de permissões ou array vazio
   */
  obterPermissoes: async () => {
    try {
      const response = await api.get('/auth/me/permissoes');

      if (response.data.success) {
        return response.data.data || [];
      }

      return [];
    } catch (error) {
      console.error('Erro ao obter permissões:', error);
      return [];
    }
  },

  /**
   * Renovar token JWT
   * @returns {Promise<string|null>} Novo token ou null se falha
   */
  renovarToken: async () => {
    try {
      const response = await api.post('/auth/refresh');

      if (response.data.success) {
        const { token } = response.data.data;
        localStorage.setItem(LOCALSTORAGE_CHAVES.TOKEN, token);
        return token;
      }

      return null;
    } catch (error) {
      console.error(MENSAGENS_ERRO.RENOVAR_TOKEN_ERRO, error);
      return null;
    }
  },

  /**
   * Verificar validade de um token
   * @param {string} token - Token JWT a verificar
   * @returns {Promise<boolean>} Verdadeiro se token é válido
   */
  verificarToken: async (token) => {
    try {
      const response = await api.post('/auth/verify', { token });
      return response.data.data?.valid || false;
    } catch {
      return false;
    }
  },

  /**
   * Alterar senha do usuário
   * @param {string} senhaAtual - Senha atual
   * @param {string} novaSenha - Nova senha desejada
   * @returns {Promise<boolean>} Sucesso da operação
   */
  alterarSenha: async (senhaAtual, novaSenha) => {
    try {
      const response = await api.post('/auth/change-password', {
        senhaAtual,
        novaSenha,
      });

      return response.data.success;
    } catch (error) {
      console.error(MENSAGENS_ERRO.ALTERAR_SENHA_ERRO, error);
      return false;
    }
  },
};

export default authService;
