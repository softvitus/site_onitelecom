/**
 * @file Serviço de Gerenciamento de Role Permissões
 * @description Serviço especializado para gerenciar permissões de funções (roles).
 * Estende o serviço genérico com mapeamento de campos entre
 * frontend e backend (roleperm_tipo → tipo, roleperm_perm_id → permissaoId, etc).
 * 
 * @module servicos/rolePermissoes
 */

import criarServicoGenerico from './base';

// ============================================================================
// CONSTANTES
// ============================================================================

const ENDPOINT_ROLE_PERMISSOES = '/role-permissoes';

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Mapeia dados do backend (roleperm_tipo, roleperm_perm_id, etc)
 * para formato do frontend (tipo, permissaoId, etc)
 * 
 * @param {Object|Array} data - Dados retornados do backend
 * @returns {Object|Array} Dados mapeados para frontend
 */
const mapearRolePermissao = (data) => {
  if (Array.isArray(data)) {
    return data.map(mapearRolePermissao);
  }

  return {
    id: data.roleperm_id,
    tipo: data.roleperm_tipo,
    permissaoId: data.roleperm_perm_id,
    permissaoNome: data.permissao?.perm_nome || '',
    permissaoModulo: data.permissao?.perm_modulo || '',
    permissaoAcao: data.permissao?.perm_acao || '',
    permissaoDescricao: data.permissao?.perm_descricao || '',
  };
};

/**
 * Mapeia dados do frontend para formato esperado pelo backend
 * 
 * @param {Object} dados - Dados do frontend
 * @returns {Object} Dados formatados para backend
 */
const mapearRolePermissaoParaBackend = (dados) => {
  return {
    roleperm_tipo: dados.tipo,
    roleperm_perm_id: dados.permissaoId,
  };
};

// ============================================================================
// SERVIÇO BASE
// ============================================================================

const servicoBase = criarServicoGenerico(ENDPOINT_ROLE_PERMISSOES);

// ============================================================================
// SERVIÇO ESPECIALIZADO
// ============================================================================

const RolePermissoesService = {
  /**
   * Lista todas as role permissões com paginação
   * 
   * @param {number} page - Número da página
   * @param {number} limit - Itens por página
   * @param {Object} filtros - Filtros (search, tipo)
   * @returns {Promise<Object>} { sucesso, dados, paginacao, erro }
   */
  listar: async (page = 1, limit = 10, filtros = {}) => {
    try {
      const resultado = await servicoBase.listar(page, limit, filtros);

      if (resultado.sucesso) {
        return {
          ...resultado,
          dados: mapearRolePermissao(resultado.dados),
        };
      }

      return resultado;
    } catch (erro) {
      console.error('[ERRO] RolePermissoesService.listar:', erro);
      return {
        sucesso: false,
        dados: [],
        erro: 'Erro ao listar role permissões',
      };
    }
  },

  /**
   * Obtém uma role permissão específica
   * 
   * @param {string|number} id - ID da role permissão
   * @returns {Promise<Object>} { sucesso, dados, erro }
   */
  obter: async (id) => {
    try {
      const resultado = await servicoBase.obter(id);

      if (resultado.sucesso) {
        return {
          ...resultado,
          dados: mapearRolePermissao(resultado.dados),
        };
      }

      return resultado;
    } catch (erro) {
      console.error('[ERRO] RolePermissoesService.obter:', erro);
      return {
        sucesso: false,
        dados: null,
        erro: 'Erro ao obter role permissão',
      };
    }
  },

  /**
   * Cria uma nova role permissão
   * 
   * @param {Object} dados - Dados da role permissão (tipo, permissaoId)
   * @returns {Promise<Object>} { sucesso, dados, erro }
   */
  criar: async (dados) => {
    try {
      const dadosFormatados = mapearRolePermissaoParaBackend(dados);
      const resultado = await servicoBase.criar(dadosFormatados);

      if (resultado.sucesso) {
        return {
          ...resultado,
          dados: mapearRolePermissao(resultado.dados),
        };
      }

      return resultado;
    } catch (erro) {
      console.error('[ERRO] RolePermissoesService.criar:', erro);
      return {
        sucesso: false,
        dados: null,
        erro: 'Erro ao criar role permissão',
      };
    }
  },

  /**
   * Atualiza uma role permissão
   * 
   * @param {string|number} id - ID da role permissão
   * @param {Object} dados - Dados a atualizar
   * @returns {Promise<Object>} { sucesso, dados, erro }
   */
  atualizar: async (id, dados) => {
    try {
      const dadosFormatados = mapearRolePermissaoParaBackend(dados);
      const resultado = await servicoBase.atualizar(id, dadosFormatados);

      if (resultado.sucesso) {
        return {
          ...resultado,
          dados: mapearRolePermissao(resultado.dados),
        };
      }

      return resultado;
    } catch (erro) {
      console.error('[ERRO] RolePermissoesService.atualizar:', erro);
      return {
        sucesso: false,
        dados: null,
        erro: 'Erro ao atualizar role permissão',
      };
    }
  },

  /**
   * Deleta uma role permissão
   * 
   * @param {string|number} id - ID da role permissão
   * @returns {Promise<Object>} { sucesso, erro }
   */
  deletar: (id) => servicoBase.deletar(id),

  /**
   * Lista role permissões por tipo
   * 
   * @param {string} tipo - Tipo de role (admin, gestor, usuario)
   * @param {number} page - Página
   * @param {number} limit - Limite
   * @returns {Promise<Object>} { sucesso, dados, paginacao, erro }
   */
  listarPorTipo: async (tipo, page = 1, limit = 10) => {
    try {
      const resultado = await RolePermissoesService.listar(page, limit, { tipo });
      return resultado;
    } catch (erro) {
      console.error('[ERRO] RolePermissoesService.listarPorTipo:', erro);
      return {
        sucesso: false,
        dados: [],
        erro: 'Erro ao listar role permissões por tipo',
      };
    }
  },

  /**
   * Busca role permissões por query
   * 
   * @param {string} query - Query de busca
   * @param {number} page - Página
   * @param {number} limit - Limite
   * @returns {Promise<Object>} { sucesso, dados, paginacao, erro }
   */
  buscar: async (query, page = 1, limit = 10) => {
    try {
      const resultado = await RolePermissoesService.listar(page, limit, { search: query });
      return resultado;
    } catch (erro) {
      console.error('[ERRO] RolePermissoesService.buscar:', erro);
      return {
        sucesso: false,
        dados: [],
        erro: 'Erro ao buscar role permissões',
      };
    }
  },
};

export default RolePermissoesService;
