/**
 * @file Serviço de Gerenciamento de Usuários
 * @description Serviço especializado para gerenciar usuários.
 * Estende o serviço genérico com mapeamento de campos entre
 * frontend e backend (usu_nome → nome, etc).
 *
 * @module servicos/usuarios
 */

import criarServicoGenerico from './base';

// ============================================================================
// CONSTANTES
// ============================================================================

const ENDPOINT_USUARIOS = '/usuarios';

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Mapeia dados do backend (usu_nome, usu_email, etc)
 * para formato do frontend (nome, email, etc)
 *
 * @param {Object|Array} data - Dados retornados do backend
 * @returns {Object|Array} Dados mapeados para frontend
 */
const mapearUsuario = (data) => {
  if (Array.isArray(data)) {
    return data.map(mapearUsuario);
  }

  return {
    id: data.usu_id,
    nome: data.usu_nome,
    email: data.usu_email,
    telefone: data.usu_telefone,
    tipo: data.usu_tipo,
    status: data.usu_status,
    parceiroId: data.usu_parceiro_id,
    descricao: `${data.usu_email}`,
    ativo: data.usu_status === 'ativo',
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
const mapearUsuarioParaBackend = (dados) => {
  const backend = {
    usu_nome: dados.nome,
    usu_email: dados.email || '',
    usu_telefone: dados.telefone || null,
    usu_tipo: dados.tipo || 'usuario',
    usu_status: dados.status || 'ativo',
  };

  // Parceiro é obrigatório para gestor e usuario
  if (dados.parceiroId) {
    backend.usu_parceiro_id = dados.parceiroId;
  } else if (dados.tipo !== 'admin') {
    // Para admin, pode ser null
    backend.usu_parceiro_id = null;
  }

  // Senha é obrigatória na criação
  if (dados.senha) {
    backend.usu_senha = dados.senha;
  }

  return backend;
};

// ============================================================================
// SERVIÇO DE USUÁRIOS
// ============================================================================

const UsuariosServiceBase = criarServicoGenerico(ENDPOINT_USUARIOS);

/**
 * Serviço para Gerenciar Usuários
 *
 * Estende o serviço genérico com mapeamento automático de campos
 * entre o formato do frontend e do backend.
 */
const UsuariosService = {
  /**
   * Listar usuários com paginação
   * @param {number} [page=1] - Página
   * @param {number} [limit=10] - Itens por página
   * @param {Object} [filtros={}] - Filtros
   * @returns {Promise<Object>} Resultado com dados mapeados
   */
  listar: async (page = 1, limit = 10, filtros = {}) => {
    const resultado = await UsuariosServiceBase.listar(page, limit, filtros);

    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearUsuario(resultado.dados),
      };
    }

    return resultado;
  },

  /**
   * Obter usuário específico
   * @param {string|number} id - ID do usuário
   * @returns {Promise<Object>} Usuário com dados mapeados
   */
  obter: async (id) => {
    const resultado = await UsuariosServiceBase.obter(id);

    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearUsuario(resultado.dados),
      };
    }

    return resultado;
  },

  /**
   * Criar novo usuário
   * @param {Object} dados - Dados do novo usuário
   * @returns {Promise<Object>} Resultado da criação
   */
  criar: async (dados) => {
    const dadosBackend = mapearUsuarioParaBackend(dados);
    return UsuariosServiceBase.criar(dadosBackend);
  },

  /**
   * Atualizar usuário
   * @param {string|number} id - ID do usuário
   * @param {Object} dados - Dados atualizados
   * @returns {Promise<Object>} Resultado da atualização
   */
  atualizar: async (id, dados) => {
    const dadosBackend = mapearUsuarioParaBackend(dados);
    return UsuariosServiceBase.atualizar(id, dadosBackend);
  },

  /**
   * Atualizar status do usuário
   * @param {string|number} id - ID do usuário
   * @param {string} status - Novo status ('ativo' ou 'inativo')
   * @returns {Promise<Object>} Resultado da atualização
   */
  atualizarStatus: async (id, status) => {
    return UsuariosServiceBase.atualizar(id, {
      usu_status: status,
    });
  },

  /**
   * Deletar usuário
   * @param {string|number} id - ID do usuário
   * @returns {Promise<Object>} Resultado da exclusão
   */
  deletar: (id) => UsuariosServiceBase.deletar(id),

  /**
   * Buscar usuários
   * @param {string} query - Termo de busca
   * @param {number} [page=1] - Página
   * @param {number} [limit=10] - Itens por página
   * @returns {Promise<Object>} Resultado da busca
   */
  buscar: (query, page = 1, limit = 10) => UsuariosService.listar(page, limit, { search: query }),

  /**
   * Listar usuários por tipo
   * @param {string} tipo - Tipo de usuário ('admin', 'gestor', 'usuario')
   * @param {number} [page=1] - Página
   * @param {number} [limit=10] - Itens por página
   * @returns {Promise<Object>} Resultado com usuários do tipo especificado
   */
  listarPorTipo: async (tipo, page = 1, limit = 10) => {
    const resultado = await UsuariosService.listar(page, limit, { tipo });
    return resultado;
  },
};

export default UsuariosService;
