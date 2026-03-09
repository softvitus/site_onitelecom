/**
 * @module middleware/audit
 * @description Middleware de auditoria - intercepta e registra todas as operações do sistema
 */

import { AuditoriaService } from '../services/AuditoriaService.js';

/**
 * Middleware para capturar dados de auditoria
 * Anexa informações ao request para uso posterior
 */
export const captureAuditData = (req, res, next) => {
  // Captura IP do cliente (considerando proxies)
  req.auditData = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    usuarioId: req.user?.usu_id, // Preenchido pelo auth middleware
    timestamp: new Date(),
  };

  // Intercepta res.json para capturar status da resposta
  const originalJson = res.json.bind(res);

  res.json = function (data) {
    if (req.auditData && req.auditData.usuarioId) {
      // Determina a ação baseado no método HTTP
      const acao = determinarAcao(req.method);

      // Determina a entidade e ID do path
      const { entidade, entidadeId } = extrairEntidadeDoPath(
        req.path,
        req.method,
        data,
      );

      // Status da auditoria
      const status = res.statusCode < 400 ? 'sucesso' : 'erro';
      const mensagemErro =
        status === 'erro' ? data.error || data.message : null;

      // Registra auditoria de forma assíncrona
      AuditoriaService.registrar({
        usuarioId: req.auditData.usuarioId,
        acao,
        entidade,
        entidadeId,
        dadosAnteriores: req.auditData.dadosAnteriores,
        dadosNovos: req.auditData.dadosNovos,
        ip: req.auditData.ip,
        userAgent: req.auditData.userAgent,
        status,
        mensagemErro,
      }).catch((err) => {
        console.error('[AUDIT MIDDLEWARE] Erro ao registrar auditoria:', err);
      });
    }

    return originalJson(data);
  };

  next();
};

/**
 * Determina a ação baseada no método HTTP
 * @param {string} metodo - Método HTTP
 * @returns {string} Tipo de ação
 */
function determinarAcao(metodo) {
  const mapa = {
    POST: 'criar',
    PUT: 'editar',
    PATCH: 'editar',
    DELETE: 'deletar',
    GET: 'visualizar',
  };
  return mapa[metodo] || 'visualizar';
}

/**
 * Extrai entidade e ID do path da requisição
 * Exemplo: /api/v1/parceiros/123 -> entidade: parceiro, entidadeId: 123
 * @param {string} path - Path da requisição
 * @param {string} metodo - Método HTTP
 * @param {Object} data - Dados da resposta
 * @returns {Object} { entidade, entidadeId }
 */
function extrairEntidadeDoPath(path, metodo, data = {}) {
  // Remove /api/v1/ do início
  let pathLimpo = path.replace(/^\/api\/[^/]+\//, '');

  // Remove query strings
  pathLimpo = pathLimpo.split('?')[0];

  // Split por /
  const partes = pathLimpo.split('/').filter(Boolean);

  if (partes.length === 0) {
    return { entidade: 'desconhecido', entidadeId: null };
  }

  // Primeira parte é a entidade (pluralizado)
  const entidadePlural = partes[0];
  const entidade = pluralizarParaSingular(entidadePlural);

  // Segunda parte é o ID
  let entidadeId = partes[1] || null;

  // Se não houver ID no path, tenta extrair da resposta
  if (!entidadeId && data && data.data) {
    // Para POST/PUT, tenta obter do data.data.id ou data.data.*_id
    if (metodo === 'POST' || metodo === 'PUT') {
      entidadeId =
        data.data.id ||
        Object.values(data.data).find(
          (v) => typeof v === 'string' && v.match(/^[0-9a-f]{8}-[0-9a-f]{4}-/i),
        );
    }
  }

  return { entidade, entidadeId };
}

/**
 * Converte plural para singular
 * @param {string} palavra - Palavra pluralizada
 * @returns {string} Palavra singularizada
 */
function pluralizarParaSingular(palavra) {
  const mapa = {
    parceiros: 'parceiro',
    temas: 'tema',
    páginas: 'pagina',
    componentes: 'componente',
    elementos: 'elemento',
    cores: 'cores',
    imagens: 'imagem',
    links: 'link',
    textos: 'texto',
    conteudos: 'conteudo',
    features: 'feature',
    usuarios: 'usuario',
    permissoes: 'permissao',
  };

  return mapa[palavra] || palavra.replace(/s$/, '');
}

/**
 * Middleware para registrar ação de login/logout
 * Deve ser chamado explicitamente
 */
export const registrarAuditLogin = (acao) => {
  return async (req, res, next) => {
    if (req.user?.usu_id) {
      await AuditoriaService.registrar({
        usuarioId: req.user.usu_id,
        acao,
        entidade: 'auth',
        entidadeId: req.user.usu_id,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'sucesso',
      });
    }
    next();
  };
};

export default captureAuditData;
