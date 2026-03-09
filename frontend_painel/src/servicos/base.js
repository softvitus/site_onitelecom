/**
 * @file Serviço CRUD Genérico Base
 * @description Factory que cria serviços CRUD genéricos para qualquer entidade.
 * Fornece operações padrão (listar, obter, criar, atualizar, deletar, buscar)
 * com tratamento de erros e formatação de respostas.
 *
 * @module servicos/base
 */

import api from './api';

// ============================================================================
// CONSTANTES
// ============================================================================

const MENSAGENS_PADRAO = {
  ERRO_DESCONHECIDO: 'Erro desconhecido',
};

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Extrai mensagem de erro de várias formatos
 * @param {string|Object} erro - Erro em formato string ou objeto
 * @returns {string} Mensagem de erro formatada
 */
const extrairMensagemErro = (erro) => {
  if (typeof erro === 'string') {
    return erro;
  }
  if (typeof erro === 'object' && erro !== null) {
    return erro.message || JSON.stringify(erro);
  }
  return MENSAGENS_PADRAO.ERRO_DESCONHECIDO;
};

// ============================================================================
// FACTORY DE SERVIÇO GENÉRICO
// ============================================================================

/**
 * Factory para criar serviço CRUD genérico
 *
 * Cria um objeto com métodos CRUD padrão para qualquer entidade,
 * automatizando requisições HTTP e tratamento de erros.
 *
 * @param {string} endpoint - Endpoint da API (ex: '/parceiros')
 * @returns {Object} Objeto com métodos CRUD (listar, obter, criar, atualizar, deletar, buscar)
 *
 * @example
 * const parceirosService = criarServicoGenerico('/parceiros');
 * const resultado = await parceirosService.listar(1, 10);
 */
const criarServicoGenerico = (endpoint) => {
  return {
    /**
     * Listar items com paginação e filtros
     * @param {number} [page=1] - Número da página
     * @param {number} [limit=10] - Itens por página
     * @param {Object} [filtros={}] - Filtros adicionais
     * @returns {Promise<Object>} { sucesso, dados, paginacao, erro }
     */
    listar: async (page = 1, limit = 10, filtros = {}) => {
      try {
        const params = new URLSearchParams({
          page,
          limit,
          ...filtros,
        });

        const response = await api.get(`${endpoint}?${params}`);

        if (response.data.success) {
          return {
            sucesso: true,
            dados: response.data.data,
            paginacao: response.data.pagination,
          };
        }

        return {
          sucesso: false,
          erro: extrairMensagemErro(response.data.error),
        };
      } catch (error) {
        return {
          sucesso: false,
          erro: extrairMensagemErro(error.response?.data?.error || error.message),
        };
      }
    },

    /**
     * Obter um item específico pelo ID
     * @param {string|number} id - ID do item
     * @returns {Promise<Object>} { sucesso, dados, erro }
     */
    obter: async (id) => {
      try {
        const response = await api.get(`${endpoint}/${id}`);

        if (response.data.success) {
          return {
            sucesso: true,
            dados: response.data.data,
          };
        }

        return {
          sucesso: false,
          erro: extrairMensagemErro(response.data.error),
        };
      } catch (error) {
        return {
          sucesso: false,
          erro: extrairMensagemErro(error.response?.data?.error || error.message),
        };
      }
    },

    /**
     * Criar novo item
     * @param {Object} dados - Dados do novo item
     * @returns {Promise<Object>} { sucesso, dados, err, detalhes }
     */
    criar: async (dados) => {
      try {
        console.log('[servicoBase.criar] Dados a enviar:', dados);
        console.log('[servicoBase.criar] Endpoint:', endpoint);
        const response = await api.post(endpoint, dados);

        if (response.data.success) {
          return {
            sucesso: true,
            dados: response.data.data,
          };
        }

        return {
          sucesso: false,
          erro: extrairMensagemErro(response.data.error),
          detalhes: response.data.details,
        };
      } catch (error) {
        return {
          sucesso: false,
          erro: extrairMensagemErro(error.response?.data?.error || error.message),
          detalhes: error.response?.data?.details,
        };
      }
    },

    /**
     * Atualizar item existente
     * @param {string|number} id - ID do item a atualizar
     * @param {Object} dados - Dados atualizados
     * @returns {Promise<Object>} { sucesso, dados, erro, detalhes }
     */
    atualizar: async (id, dados) => {
      try {
        const response = await api.put(`${endpoint}/${id}`, dados);

        if (response.data.success) {
          return {
            sucesso: true,
            dados: response.data.data,
          };
        }

        return {
          sucesso: false,
          erro: extrairMensagemErro(response.data.error),
          detalhes: response.data.details,
        };
      } catch (error) {
        return {
          sucesso: false,
          erro: extrairMensagemErro(error.response?.data?.error || error.message),
          detalhes: error.response?.data?.details,
        };
      }
    },

    /**
     * Deletar item
     * @param {string|number} id - ID do item a deletar
     * @returns {Promise<Object>} { sucesso, dados, erro }
     */
    deletar: async (id) => {
      try {
        const response = await api.delete(`${endpoint}/${id}`);

        // Backend retorna 204 No Content para delete bem-sucedido
        if (response.status === 204 || response.data?.success) {
          return {
            sucesso: true,
            dados: response.data?.data || null,
          };
        }

        return {
          sucesso: false,
          erro: extrairMensagemErro(response.data?.error),
        };
      } catch (error) {
        return {
          sucesso: false,
          erro: extrairMensagemErro(error.response?.data?.error || error.message),
        };
      }
    },

    /**
     * Buscar items com query
     * @param {string} query - Termo de busca
     * @param {number} [page=1] - Número da página
     * @param {number} [limit=10] - Itens por página
     * @returns {Promise<Object>} Resultado da busca (mesmo que listar)
     */
    buscar: async (query, page = 1, limit = 10) => {
      return this.listar(page, limit, { search: query });
    },
  };
};

export default criarServicoGenerico;
