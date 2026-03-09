/**
 * @file Serviço de Gerenciamento de Imagens
 * @description Serviço especializado para gerenciar imagens.
 * Estende o serviço genérico com mapeamento de campos entre
 * frontend e backend (img_nome → nome, etc).
 *
 * @module servicos/imagens
 */

import criarServicoGenerico from './base';

// ============================================================================
// CONSTANTES
// ============================================================================

const ENDPOINT_IMAGENS = '/imagens';

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Mapeia dados do backend (img_nome, img_categoria, etc)
 * para formato do frontend (nome, categoria, etc)
 *
 * @param {Object|Array} data - Dados retornados do backend
 * @returns {Object|Array} Dados mapeados para frontend
 */
const mapearImagem = (data) => {
  if (Array.isArray(data)) {
    return data.map(mapearImagem);
  }

  return {
    id: data.img_id,
    temaId: data.img_tem_id,
    categoria: data.img_categoria,
    nome: data.img_nome,
    valor: data.img_valor,
  };
};

/**
 * Mapeia dados do frontend para formato esperado pelo backend
 *
 * @param {Object} dados - Dados do frontend
 * @returns {Object} Dados formatados para backend
 */
const mapearImagemParaBackend = (dados) => {
  return {
    img_tem_id: dados.temaId,
    img_categoria: dados.categoria,
    img_nome: dados.nome,
    img_valor: dados.valor || '',
  };
};

// ============================================================================
// SERVIÇO DE IMAGENS
// ============================================================================

const ImagensServiceBase = criarServicoGenerico(ENDPOINT_IMAGENS);

/**
 * Serviço para Gerenciar Imagens
 *
 * Estende o serviço genérico com mapeamento automático de campos
 * entre o formato do frontend e do backend.
 */
const ImagensService = {
  /**
   * Listar imagens com paginação
   * @param {number} [page=1] - Página
   * @param {number} [limit=10] - Itens por página
   * @param {Object} [filtros={}] - Filtros
   * @returns {Promise<Object>} Resultado com dados mapeados
   */
  listar: async (page = 1, limit = 10, filtros = {}) => {
    const resultado = await ImagensServiceBase.listar(page, limit, filtros);

    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearImagem(resultado.dados),
      };
    }

    return resultado;
  },

  /**
   * Obter imagem específica
   * @param {string|number} id - ID da imagem
   * @returns {Promise<Object>} Imagem com dados mapeados
   */
  obter: async (id) => {
    const resultado = await ImagensServiceBase.obter(id);

    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearImagem(resultado.dados),
      };
    }

    return resultado;
  },

  /**
   * Criar nova imagem
   * @param {Object} dados - Dados da nova imagem
   * @returns {Promise<Object>} Resultado da criação
   */
  criar: async (dados) => {
    const dadosBackend = mapearImagemParaBackend(dados);
    return ImagensServiceBase.criar(dadosBackend);
  },

  /**
   * Atualizar imagem
   * @param {string|number} id - ID da imagem
   * @param {Object} dados - Dados atualizados
   * @returns {Promise<Object>} Resultado da atualização
   */
  atualizar: async (id, dados) => {
    const dadosBackend = mapearImagemParaBackend(dados);
    return ImagensServiceBase.atualizar(id, dadosBackend);
  },

  /**
   * Deletar imagem
   * @param {string|number} id - ID da imagem
   * @returns {Promise<Object>} Resultado da exclusão
   */
  deletar: (id) => ImagensServiceBase.deletar(id),

  /**
   * Buscar imagens por nome ou categoria
   * @param {string} termo - Termo de busca
   * @param {number} [limit=20] - Limite de resultados
   * @returns {Promise<Object>} Resultados filtrados
   */
  buscar: async (termo, limit = 20) => {
    const resultado = await ImagensServiceBase.buscar(termo, limit);

    if (resultado.sucesso) {
      return {
        ...resultado,
        dados: mapearImagem(resultado.dados),
      };
    }

    return resultado;
  },
};

export default ImagensService;
