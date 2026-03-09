/**
 * @file Serviço de Gerenciamento de Permissões
 * @description Serviço especializado para gerenciar permissões.
 * Estende o serviço genérico com mapeamento de campos entre
 * frontend e backend (perm_modulo → modulo, etc).
 *
 * @module servicos/permissoes
 */

import criarServicoGenerico from './base';

// ============================================================================
// CONSTANTES
// ============================================================================

const ENDPOINT_PERMISSOES = '/permissoes';

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Mapeia dados do backend (perm_modulo, perm_acao, etc)
 * para formato do frontend (modulo, acao, etc)
 *
 * @param {Object|Array} data - Dados retornados do backend
 * @returns {Object|Array} Dados mapeados para frontend
 */
const mapearPermissao = (data) => {
  if (Array.isArray(data)) {
    return data.map(mapearPermissao);
  }

  return {
    id: data.perm_id,
    modulo: data.perm_modulo,
    acao: data.perm_acao,
    descricao: data.perm_descricao || `${data.perm_modulo} - ${data.perm_acao}`,
    nome: data.perm_nome,
    dataCriacao: data.created_at,
    dataAtualizacao: data.updated_at,
  };
};

/**
 * Mapeia dados do frontend para formato esperado pelo backend
 *
 * @param {Object} dados - Dados do frontend
 * @returns {Object} Dados formatados para backend
 */
const mapearPermissaoParaBackend = (dados) => {
  return {
    perm_modulo: dados.modulo,
    perm_acao: dados.acao,
    perm_descricao: dados.descricao || '',
    // perm_nome é gerado automaticamente no backend: `modulo_acao`
  };
};

// ============================================================================
// SERVIÇO BASE
// ============================================================================

const servicoBase = criarServicoGenerico(ENDPOINT_PERMISSOES);

// ============================================================================
// SERVIÇO ESPECIALIZADO
// ============================================================================

const PermissoesService = {
  /**
   * Lista todas as permissões com paginação
   *
   * @param {number} page - Número da página
   * @param {number} limit - Itens por página
   * @param {Object} filtros - Filtros (search, modulo, acao)
   * @returns {Promise<Object>} { sucesso, dados, paginacao, erro }
   */
  listar: async (page = 1, limit = 10, filtros = {}) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('limit', limit);

      if (filtros.search) {
        queryParams.append('search', filtros.search);
      }

      if (filtros.modulo) {
        queryParams.append('modulo', filtros.modulo);
      }

      if (filtros.acao) {
        queryParams.append('acao', filtros.acao);
      }

      const resultado = await servicoBase.listar(page, limit, filtros);

      if (resultado.sucesso) {
        return {
          ...resultado,
          dados: mapearPermissao(resultado.dados),
        };
      }

      return resultado;
    } catch (erro) {
      console.error('[ERRO] PermissoesService.listar:', erro);
      return {
        sucesso: false,
        dados: [],
        erro: 'Erro ao listar permissões',
      };
    }
  },

  /**
   * Obtém uma permissão específica
   *
   * @param {string|number} id - ID da permissão
   * @returns {Promise<Object>} { sucesso, dados, erro }
   */
  obter: async (id) => {
    try {
      const resultado = await servicoBase.obter(id);

      if (resultado.sucesso) {
        return {
          ...resultado,
          dados: mapearPermissao(resultado.dados),
        };
      }

      return resultado;
    } catch (erro) {
      console.error('[ERRO] PermissoesService.obter:', erro);
      return {
        sucesso: false,
        dados: null,
        erro: 'Erro ao obter permissão',
      };
    }
  },

  /**
   * Cria uma nova permissão
   *
   * @param {Object} dados - Dados da permissão (modulo, acao, descricao, habilitado)
   * @returns {Promise<Object>} { sucesso, dados, erro }
   */
  criar: async (dados) => {
    try {
      const dadosFormatados = mapearPermissaoParaBackend(dados);
      const resultado = await servicoBase.criar(dadosFormatados);

      if (resultado.sucesso) {
        return {
          ...resultado,
          dados: mapearPermissao(resultado.dados),
        };
      }

      return resultado;
    } catch (erro) {
      console.error('[ERRO] PermissoesService.criar:', erro);
      return {
        sucesso: false,
        dados: null,
        erro: 'Erro ao criar permissão',
      };
    }
  },

  /**
   * Atualiza uma permissão (mantém apenas campos não-status)
   *
   * @param {string|number} id - ID da permissão
   * @param {Object} dados - Dados a atualizar
   * @returns {Promise<Object>} { sucesso, dados, erro }
   */
  atualizar: async (id, dados) => {
    try {
      // Não enviamos status na atualização, apenas modulo e acao
      const dadosAtualizar = {
        perm_modulo: dados.modulo,
        perm_acao: dados.acao,
        perm_descricao: dados.descricao || '',
      };

      const resultado = await servicoBase.atualizar(id, dadosAtualizar);

      if (resultado.sucesso) {
        return {
          ...resultado,
          dados: mapearPermissao(resultado.dados),
        };
      }

      return resultado;
    } catch (erro) {
      console.error('[ERRO] PermissoesService.atualizar:', erro);
      return {
        sucesso: false,
        dados: null,
        erro: 'Erro ao atualizar permissão',
      };
    }
  },

  /**
   * Alterna o status (habilitado/desabilitado) de uma permissão
   *
   * @param {string|number} id - ID da permissão
   * @param {string} status - Novo status (habilitado ou desabilitado)
   * @returns {Promise<Object>} { sucesso, dados, erro }
   */
  atualizarStatus: async (id, status) => {
    try {
      const dados = {
        perm_habilitado: status === 'habilitado',
      };

      const resultado = await servicoBase.atualizar(id, dados);

      if (resultado.sucesso) {
        return {
          ...resultado,
          dados: mapearPermissao(resultado.dados),
        };
      }

      return resultado;
    } catch (erro) {
      console.error('[ERRO] PermissoesService.atualizarStatus:', erro);
      return {
        sucesso: false,
        dados: null,
        erro: 'Erro ao atualizar status da permissão',
      };
    }
  },

  /**
   * Deleta uma permissão
   *
   * @param {string|number} id - ID da permissão
   * @returns {Promise<Object>} { sucesso, erro }
   */
  deletar: (id) => servicoBase.deletar(id),

  /**
   * Lista permissões por módulo
   *
   * @param {string} modulo - Módulo
   * @param {number} page - Página
   * @param {number} limit - Limite
   * @returns {Promise<Object>} { sucesso, dados, paginacao, erro }
   */
  listarPorModulo: async (modulo, page = 1, limit = 10) => {
    try {
      const resultado = await PermissoesService.listar(page, limit, { modulo });
      return resultado;
    } catch (erro) {
      console.error('[ERRO] PermissoesService.listarPorModulo:', erro);
      return {
        sucesso: false,
        dados: [],
        erro: 'Erro ao listar permissões por módulo',
      };
    }
  },

  /**
   * Busca permissões por query
   *
   * @param {string} query - Query de busca
   * @param {number} page - Página
   * @param {number} limit - Limite
   * @returns {Promise<Object>} { sucesso, dados, paginacao, erro }
   */
  buscar: async (query, page = 1, limit = 10) => {
    try {
      const resultado = await PermissoesService.listar(page, limit, { search: query });
      return resultado;
    } catch (erro) {
      console.error('[ERRO] PermissoesService.buscar:', erro);
      return {
        sucesso: false,
        dados: [],
        erro: 'Erro ao buscar permissões',
      };
    }
  },
};

export default PermissoesService;
