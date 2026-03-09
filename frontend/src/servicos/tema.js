/**
 * ============================================================================
 * Tema - Serviço de Gerenciamento de Temas de Parceiros
 * ============================================================================
 * @module servicos/tema
 * @description Serviço completo para busca, cache e acesso aos dados do tema.
 *              Gerencia cores, imagens, textos, links, conteúdos, features,
 *              páginas e componentes do tema ativo.
 *
 * @features
 * - Cache em memória com TTL configurável
 * - Conversão automática Base64 → Data URL
 * - Getters organizados por tipo de dado
 * - Suporte a agrupamento por categoria
 *
 * @example
 * // Buscar tema com cache
 * const { success, data } = await buscarOuCachearTemaParceiro('parceiro-id');
 *
 * @example
 * // Acessar dados do tema
 * const cores = getTemaCores();
 * const logo = getImagem('logo', 'principal');
 * const titulo = getTexto('home', 'titulo');
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { get } from './api';

// ============================================================================
// TENANT - Detecção de Parceiro
// ============================================================================

/** Cache em memória dos parceiros */
let parceirosCached = null;
let parceirosCacheTime = null;

/**
 * Busca todos os parceiros da API (com cache)
 * @returns {Promise<Array>} Lista de parceiros
 */
export const getAllParceirosFromAPI = async () => {
  // Verificar cache em memória (válido por 5 minutos)
  if (parceirosCached && parceirosCacheTime && Date.now() - parceirosCacheTime < 5 * 60 * 1000) {
    return parceirosCached;
  }

  try {
    const response = await get('/public/parceiros');

    if (response.success && Array.isArray(response.data)) {
      parceirosCached = response.data;
      parceirosCacheTime = Date.now();

      localStorage.setItem(
        '_parceiros_cache',
        JSON.stringify({
          data: response.data,
          timestamp: Date.now(),
        })
      );

      return response.data;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[Tema] Erro ao buscar parceiros da API:', error);
  }

  // Tentar recuperar do localStorage
  try {
    const cached = localStorage.getItem('_parceiros_cache');
    if (cached) {
      const { data } = JSON.parse(cached);
      parceirosCached = data;
      return data;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[Tema] Erro ao recuperar parceiros do localStorage:', error);
  }

  return [];
};

/**
 * Detecta qual cliente/tenant está acessando baseado no domínio atual
 * @returns {Promise<string>} ID do parceiro detectado
 */
export const detectTenant = async () => {
  // Query parameter tem prioridade (útil para testes)
  const urlParams = new URLSearchParams(window.location.search);
  const tenantParam = urlParams.get('tenant');
  if (tenantParam) {
    return tenantParam;
  }

  // Monta a URL atual
  const hostname = window.location.hostname;
  const port = window.location.port;
  const currentUrl = port ? `http://${hostname}:${port}` : `https://${hostname}`;

  // Busca na API qual parceiro tem este domínio
  const allParceiros = await getAllParceirosFromAPI();

  for (const parceiro of allParceiros) {
    if (parceiro.dominio === currentUrl || parceiro.dominio === currentUrl + '/') {
      return parceiro.id;
    }
  }

  for (const parceiro of allParceiros) {
    if (parceiro.dominio && parceiro.dominio.includes(hostname)) {
      return parceiro.id;
    }
  }

  // eslint-disable-next-line no-console
  console.warn(`[Tema] Nenhum parceiro encontrado para ${currentUrl}, usando fallback: onitelecom`);
  return 'onitelecom';
};

/**
 * Inicializa configuração do cliente
 * @returns {Promise<Object>} Resultado da inicialização
 */
export const initializeConfig = async () => {
  try {
    const tenant = await detectTenant();
    return { success: true, tenant, config: {} };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Tema] Erro ao inicializar configuração:', error);
    return { success: false, tenant: 'onitelecom', config: {}, error: error.message };
  }
};

// ============================================================================
// CONSTANTES
// ============================================================================

/** @constant {number} CACHE_TTL - Tempo de vida do cache (1 hora) */
const CACHE_TTL = 1000 * 60 * 60;

/** @constant {string} STORAGE_KEY_PARCEIRO - Chave do localStorage para parceiro */
const STORAGE_KEY_PARCEIRO = 'currentParceiro';

/** @constant {Object} CAMINHO_MAP - Mapeamento de rotas alternativas */
const CAMINHO_MAP = Object.freeze({
  '/inicio': '/',
  inicio: '/',
  '/empresas': '/para-empresas',
  empresas: '/para-empresas',
});

/** @constant {number} DEFAULT_ORDER - Ordem padrão para itens sem ordem */
const DEFAULT_ORDER = 999;

// ============================================================================
// ESTADO EM MEMÓRIA
// ============================================================================

/** @type {Object|null} Tema ativo em memória */
let temaAtivoMemoria = null;

/** @type {Map<string, {tema: Object, timestamp: number}>} Cache de temas */
const CACHE_TEMAS = new Map();

// ============================================================================
// FUNÇÕES INTERNAS - MEMÓRIA
// ============================================================================

/**
 * Define o tema ativo em memória
 * @private
 * @param {Object} tema - Dados do tema
 */
const setTemaAtivoMemoria = (tema) => {
  temaAtivoMemoria = tema;
};

/**
 * Obtém o tema ativo em memória
 * @private
 * @returns {Object|null}
 */
const getTemaAtivoMemoria = () => temaAtivoMemoria;

// ============================================================================
// FUNÇÕES INTERNAS - UTILITÁRIOS
// ============================================================================

/**
 * Converte Base64 para Data URL válida
 * @private
 * @param {string} base64 - String base64 da imagem
 * @returns {string} Data URL ou string original
 */
const base64ToDataUrl = (base64) => {
  if (!base64 || typeof base64 !== 'string') return '';

  // Se já é URL válida, retorna como está
  if (
    base64.startsWith('data:') ||
    base64.startsWith('http://') ||
    base64.startsWith('https://') ||
    base64.startsWith('/')
  ) {
    return base64;
  }

  // Detecta tipo de imagem pelo header base64
  const mimeTypes = {
    '/9j/': 'image/jpeg',
    iVBOR: 'image/png',
    R0lGOD: 'image/gif',
    UklGR: 'image/webp',
    PHN2Zy: 'image/svg+xml',
    PD94bW: 'image/svg+xml',
  };

  let mimeType = 'image/png'; // default

  for (const [prefix, type] of Object.entries(mimeTypes)) {
    if (base64.startsWith(prefix)) {
      mimeType = type;
      break;
    }
  }

  return `data:${mimeType};base64,${base64}`;
};

/**
 * Ordena array por propriedade 'ordem'
 * @private
 * @param {Array} items - Array a ordenar
 * @returns {Array} Array ordenado
 */
const sortByOrdem = (items) => {
  return [...items].sort((a, b) => {
    const ordemA = a.ordem ?? DEFAULT_ORDER;
    const ordemB = b.ordem ?? DEFAULT_ORDER;
    return ordemA - ordemB;
  });
};

/**
 * Converte espaços e caracteres especiais para kebab-case
 * @private
 * @param {string} str - String a converter
 * @returns {string} String em kebab-case
 */
const toKebabCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

// ============================================================================
// API - BUSCA DE TEMA
// ============================================================================

/**
 * Busca o tema completo do parceiro pela ID
 * @async
 * @param {string} parceiroId - ID do parceiro
 * @returns {Promise<TemaResponse>}
 *
 * @example
 * const { success, data } = await buscarTemaParceiro('abc123');
 */
export const buscarTemaParceiro = async (parceiroId) => {
  try {
    if (!parceiroId) {
      // eslint-disable-next-line no-console
      console.error('[Tema] ID do parceiro não fornecido');
      return { success: false, data: null, error: 'ID do parceiro não fornecido' };
    }

    const response = await get(`/public/parceiros/${parceiroId}/tema`);

    if (response.success && response.data) {
      setTemaAtivoMemoria(response.data);
      // ✅ Aplicar cores do tema como variáveis CSS globais (passando tema direto)
      applyTemaCoresCSS(response.data);
      return response;
    }

    // eslint-disable-next-line no-console
    console.error('[Tema] Erro ao carregar tema:', response.error);
    return { success: false, data: null, error: 'Tema não encontrado' };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Tema] Exceção ao buscar tema:', error.message);
    return { success: false, data: null, error: error.message };
  }
};

/**
 * Busca o tema com cache inteligente
 * @async
 * @param {string} parceiroId - ID do parceiro
 * @returns {Promise<TemaResponse>}
 *
 * @example
 * const { success, data } = await buscarOuCachearTemaParceiro('abc123');
 */
export const buscarOuCachearTemaParceiro = async (parceiroId) => {
  try {
    if (!parceiroId) {
      return { success: false, data: null };
    }

    // Tenta recuperar do cache primeiro
    const cached = getTemaCached(parceiroId);
    if (cached) {
      return { success: true, data: cached };
    }

    // Busca da API
    const response = await buscarTemaParceiro(parceiroId);

    if (response.success && response.data) {
      cacheTemaParceiro(parceiroId, response.data);
      return { success: true, data: response.data };
    }

    return response;
  } catch (error) {
    return { success: false, data: null, error: error.message };
  }
};

// ============================================================================
// CACHE
// ============================================================================

/**
 * Salva tema no cache em memória
 * @param {string} parceiroId - ID do parceiro
 * @param {Object} tema - Dados do tema
 */
export const cacheTemaParceiro = (parceiroId, tema) => {
  try {
    CACHE_TEMAS.set(parceiroId, {
      tema,
      timestamp: Date.now(),
    });
    setTemaAtivoMemoria(tema);
    // ✅ Aplicar cores do tema como variáveis CSS globais (passando tema direto)
    applyTemaCoresCSS(tema);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[Tema] Erro ao cachear tema:', error);
  }
};

/**
 * Recupera tema do cache se válido
 * @param {string} parceiroId - ID do parceiro
 * @returns {Object|null}
 */
export const getTemaCached = (parceiroId) => {
  try {
    const cached = CACHE_TEMAS.get(parceiroId);

    if (!cached) return null;

    const { tema, timestamp } = cached;

    // Verifica validade
    if (Date.now() - timestamp > CACHE_TTL) {
      CACHE_TEMAS.delete(parceiroId);
      return null;
    }

    return tema;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[Tema] Erro ao recuperar cache:', error);
    return null;
  }
};

/**
 * Limpa cache de um parceiro específico
 * @param {string} parceiroId - ID do parceiro
 */
export const clearTemaCacheForParceiro = (parceiroId) => {
  CACHE_TEMAS.delete(parceiroId);
};

/**
 * Limpa todo o cache de temas
 */
export const clearAllTemaCache = () => {
  CACHE_TEMAS.clear();
};

// ============================================================================
// PARCEIRO ATUAL (localStorage)
// ============================================================================

/**
 * Recupera ID do parceiro atual
 * @returns {string|null}
 */
export const getCurrentParceiroId = () => {
  try {
    const currentParceiro = localStorage.getItem(STORAGE_KEY_PARCEIRO);
    if (currentParceiro) {
      const { id } = JSON.parse(currentParceiro);
      return id;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[Tema] Erro ao recuperar ID do parceiro:', error);
  }
  return null;
};

/**
 * Recupera dados completos do parceiro atual
 * @returns {Object|null}
 */
export const getCurrentParceiro = () => {
  try {
    const currentParceiro = localStorage.getItem(STORAGE_KEY_PARCEIRO);
    if (currentParceiro) {
      return JSON.parse(currentParceiro);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[Tema] Erro ao recuperar dados do parceiro:', error);
  }
  return null;
};

/**
 * Limpa dados do parceiro atual
 */
export const clearCurrentParceiro = () => {
  localStorage.removeItem(STORAGE_KEY_PARCEIRO);
};

// ============================================================================
// CORES
// ============================================================================

/**
 * Recupera todas as cores do tema
 * @returns {Array<TemaCorItem>}
 */
export const getTemaCores = () => {
  try {
    const tema = getTemaAtivoMemoria();
    return tema?.cores || [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[Tema] Erro ao recuperar cores:', error);
    return [];
  }
};

/**
 * Obtém cor específica por categoria e nome
 * @param {string} categoria - Categoria (ex: 'primary', 'secondary')
 * @param {string} nome - Nome da cor (ex: 'main', 'light')
 * @returns {TemaCorItem|null}
 */
export const getTemaCor = (categoria, nome) => {
  const cores = getTemaCores();
  return cores.find((c) => c.categoria === categoria && c.nome === nome) || null;
};

/**
 * Obtém todas as cores de uma categoria
 * @param {string} categoria - Categoria da cor
 * @returns {Array<TemaCorItem>}
 */
export const getTemaCorsByCategoria = (categoria) => {
  const cores = getTemaCores();
  return cores.filter((c) => c.categoria === categoria);
};

/**
 * Obtém cores ativas apenas
 * @returns {Array<TemaCorItem>}
 */
export const getTemaAtivas = () => {
  const cores = getTemaCores();
  return cores.filter((c) => c.ativo !== false); // Considera true ou undefined como ativo
};

/**
 * Obtém cores de um componente específico
 * @param {string} componente - Nome do componente (ex: 'Header', 'Ofertas')
 * @returns {Array<TemaCorItem>}
 */
export const getTemaCorsByComponente = (componente) => {
  const cores = getTemaCores();
  return cores.filter((c) => c.componente === componente);
};

/**
 * Obtém cor pela referência de variável CSS
 * @param {string} variavelRef - Referência da variável CSS (ex: 'var(--header-background)')
 * @returns {TemaCorItem|null}
 */
export const getTemaCorByVariavelRef = (variavelRef) => {
  const cores = getTemaCores();
  return cores.find((c) => c.variavel_ref === variavelRef) || null;
};

/**
 * Agrupa cores por categoria
 * @returns {Object<string, Object<string, string>>}
 */
export const getTemaCoresGrouped = () => {
  const cores = getTemaCores();
  const grouped = {};

  cores.forEach((cor) => {
    if (!grouped[cor.categoria]) {
      grouped[cor.categoria] = {};
    }
    grouped[cor.categoria][cor.nome] = cor.valor;
  });

  return grouped;
};

/**
 * Aplica cores do tema como variáveis CSS no :root
 * @description Converte cores da API em CSS custom properties
 *              Aplica tanto no formato da API quanto no formato do variables.css
 * @param {Object|Array} [temaOuCores=null] - Objeto tema completo ou array de cores direto da API
 *                                            Se null, tenta recuperar de getTemaAtivoMemoria()
 * @returns {boolean} True se aplicado com sucesso
 *
 * @example
 * // Após carregar tema da API (passando diretamente):
 * applyTemaCoresCSS(temaDadosCompletos);
 * // Resultado: --color-primary-main: #FF6600;
 */
export const applyTemaCoresCSS = (temaOuCores = null) => {
  try {
    // Extrair cores do param ou do estado em memória
    let cores = [];

    if (temaOuCores) {
      // Se passou array direto (cores)
      if (Array.isArray(temaOuCores)) {
        cores = temaOuCores;
      }
      // Se passou objeto tema completo
      else if (temaOuCores.cores) {
        cores = temaOuCores.cores;
      }
    } else {
      // Fallback: tentar do estado em memória
      cores = getTemaCores();
    }

    if (!cores || cores.length === 0) {
      return false;
    }

    const root = document.documentElement;

    // Aplicar cada cor como variável CSS
    cores.forEach((cor) => {
      // Pular cores inativas (se campo ativo existir e for false)
      if (cor.ativo === false) {
        return;
      }

      if (cor.categoria && cor.nome && cor.valor) {
        try {
          // Usar apenas o que vem da API
          const varName = `--color-${toKebabCase(cor.categoria)}-${toKebabCase(cor.nome)}`;
          root.style.setProperty(varName, cor.valor);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn(`[Tema] Erro ao aplicar cor ${cor.categoria}/${cor.nome}:`, err);
        }
      }
    });

    // Aplicar cores de componentes específicos - DINÂMICO
    // Buscar todas as cores com categoria 'componente' automaticamente
    cores.forEach((cor) => {
      // Pular cores inativas
      if (cor.ativo === false) {
        return;
      }

      if (cor.categoria === 'componente' && cor.nome && cor.valor) {
        const varName = `--${cor.nome.replace(/_/g, '-')}`;
        root.style.setProperty(varName, cor.valor);
      }
    });

    // 5. Aplicar configurações (radius, transitions) da API
    let configs = [];
    if (temaOuCores && temaOuCores.configs) {
      configs = temaOuCores.configs;
    } else {
      configs = getTemaConfigs();
    }

    if (configs && configs.length > 0) {
      configs.forEach((config) => {
        if (config.chave && config.valor) {
          // Converte underscore para hífen: radius_sm → radius-sm
          const cssVarName = `--${config.chave.replace(/_/g, '-')}`;
          root.style.setProperty(cssVarName, config.valor);
        }
      });
    }

    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Tema] Erro ao aplicar cores CSS:', error);
    return false;
  }
};

// ============================================================================
// IMAGENS
// ============================================================================

/**
 * Obtém cores de um componente específico
 * @param {string} componentName - Nome do componente (ex: 'servicosEssenciais')
 * @returns {Object} Objeto com cores do componente
 *
 * @example
 * const colors = getComponentColors('servicosEssenciais');
 * // Retorna: { container: '#f5f5f5', card: '#ffffff', ... }
 */
export const getComponentColors = (componentName) => {
  const cores = getTemaCores();
  const componentColors = {};

  cores.forEach((cor) => {
    // Buscar cores com categoria 'componente' e nome começando com 'componentName_'
    if (cor.categoria === 'componente' && cor.nome?.startsWith(`${componentName}_`)) {
      const colorKey = cor.nome.substring(`${componentName}_`.length);
      componentColors[colorKey] = cor.valor;
    }
  });

  return componentColors;
};

/**
 * Aplica cores de um componente ao DOM via CSS variables
 * @param {string} componentName - Nome do componente
 * @param {Object} varMapping - Mapeamento de chaves para nomes de variáveis CSS
 *
 * @example
 * applyComponentColorsCSS('servicosEssenciais', {
 *   container: '--servicosEssenciais-container',
 *   card: '--servicosEssenciais-card',
 * });
 */
export const applyComponentColorsCSS = (componentName, varMapping) => {
  const colors = getComponentColors(componentName);
  const root = document.documentElement;

  Object.entries(varMapping).forEach(([colorKey, varName]) => {
    if (colors[colorKey]) {
      root.style.setProperty(varName, colors[colorKey]);
    }
  });
};

// ============================================================================
// IMAGENS
// ============================================================================

/**
 * Recupera todas as imagens do tema
 * @returns {Array<TemaImagemItem>}
 */
export const getTemaImagens = () => {
  try {
    const tema = getTemaAtivoMemoria();
    return tema?.imagens || [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[Tema] Erro ao recuperar imagens:', error);
    return [];
  }
};

/**
 * Obtém imagem específica por categoria e nome
 * @param {string} categoria - Categoria (ex: 'logo', 'banner')
 * @param {string} nome - Nome da imagem
 * @returns {TemaImagemItem|null}
 */
export const getTemaImagem = (categoria, nome) => {
  const imagens = getTemaImagens();
  const nomeLower = nome?.toLowerCase();
  return (
    imagens.find((i) => i.categoria === categoria && i.nome?.toLowerCase() === nomeLower) || null
  );
};

/**
 * Obtém valor (URL) de imagem específica
 * @param {string} categoria - Categoria da imagem
 * @param {string} nome - Nome da imagem
 * @param {string} [fallback=''] - Valor padrão
 * @returns {string} Data URL ou URL da imagem
 */
export const getImagem = (categoria, nome, fallback = '') => {
  const imagem = getTemaImagem(categoria, nome);
  const valor = imagem?.valor || fallback;
  return base64ToDataUrl(valor);
};

/**
 * Obtém todas as imagens de uma categoria
 * @param {string} categoria - Categoria da imagem
 * @returns {Array<TemaImagemItem>}
 */
export const getTemaImagensByCategoria = (categoria) => {
  const imagens = getTemaImagens();
  return imagens
    .filter((i) => i.categoria === categoria)
    .map((img) => ({
      ...img,
      valor: base64ToDataUrl(img.valor),
    }));
};

/**
 * Agrupa imagens por categoria
 * @returns {Object<string, Object<string, string>>}
 */
export const getTemaImagensGrouped = () => {
  const imagens = getTemaImagens();
  const grouped = {};

  imagens.forEach((img) => {
    if (!grouped[img.categoria]) {
      grouped[img.categoria] = {};
    }
    grouped[img.categoria][img.nome] = base64ToDataUrl(img.valor);
  });

  return grouped;
};

// ============================================================================
// TEXTOS
// ============================================================================

/**
 * Recupera todos os textos do tema
 * @returns {Array<TemaTextoItem>}
 */
export const getTemaTextos = () => {
  try {
    const tema = getTemaAtivoMemoria();
    return tema?.textos || [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[Tema] Erro ao recuperar textos:', error);
    return [];
  }
};

/**
 * Obtém texto específico por categoria e chave
 * @param {string} categoria - Categoria (ex: 'home', 'footer')
 * @param {string} chave - Chave do texto (ex: 'titulo', 'descricao')
 * @returns {TemaTextoItem|null}
 */
export const getTemaTexto = (categoria, chave) => {
  const textos = getTemaTextos();
  return textos.find((t) => t.categoria === categoria && t.chave === chave) || null;
};

/**
 * Obtém valor de texto específico
 * @param {string} categoria - Categoria do texto
 * @param {string} chave - Chave do texto
 * @param {string} [fallback=''] - Valor padrão
 * @returns {string}
 */
export const getTexto = (categoria, chave, fallback = '') => {
  const texto = getTemaTexto(categoria, chave);
  return texto?.valor || fallback;
};

/**
 * Obtém todos os textos de uma categoria
 * @param {string} categoria - Categoria do texto
 * @returns {Array<TemaTextoItem>}
 */
export const getTemaTextosByCategoria = (categoria) => {
  const textos = getTemaTextos();
  return textos.filter((t) => t.categoria === categoria);
};

/**
 * Agrupa textos por categoria e chave
 * @returns {Object<string, Object<string, string>>}
 */
export const getTemaTextosGrouped = () => {
  const textos = getTemaTextos();
  const grouped = {};

  textos.forEach((txt) => {
    if (!grouped[txt.categoria]) {
      grouped[txt.categoria] = {};
    }
    grouped[txt.categoria][txt.chave] = txt.valor;
  });

  return grouped;
};

// ============================================================================
// LINKS
// ============================================================================

/**
 * Recupera todos os links do tema
 * @returns {Array<TemaLinkItem>}
 */
export const getTemaLinks = () => {
  try {
    const tema = getTemaAtivoMemoria();
    return tema?.links || [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[Tema] Erro ao recuperar links:', error);
    return [];
  }
};

/**
 * Obtém link específico por categoria e nome
 * @param {string} categoria - Categoria (ex: 'social', 'menu')
 * @param {string} nome - Nome do link
 * @returns {TemaLinkItem|null}
 */
export const getTemaLink = (categoria, nome) => {
  const links = getTemaLinks();
  return links.find((l) => l.categoria === categoria && l.nome === nome) || null;
};

/**
 * Obtém valor (URL) de link específico
 * @param {string} categoria - Categoria do link
 * @param {string} nome - Nome do link
 * @param {string} [fallback='#'] - Valor padrão
 * @returns {string}
 */
export const getLink = (categoria, nome, fallback = '#') => {
  const link = getTemaLink(categoria, nome);
  return link?.valor || fallback;
};

/**
 * Obtém todos os links de uma categoria
 * @param {string} categoria - Categoria do link
 * @returns {Array<TemaLinkItem>}
 */
export const getTemaLinksByCategoria = (categoria) => {
  const links = getTemaLinks();
  return links.filter((l) => l.categoria === categoria);
};

/**
 * Agrupa links por categoria e nome
 * @returns {Object<string, Object<string, string>>}
 */
export const getTemaLinksGrouped = () => {
  const links = getTemaLinks();
  const grouped = {};

  links.forEach((link) => {
    if (!grouped[link.categoria]) {
      grouped[link.categoria] = {};
    }
    grouped[link.categoria][link.nome] = link.valor;
  });

  return grouped;
};

/**
 * Obtém links de menu parseados
 * @param {string} menuName - Nome do menu (ex: 'Top Bar', 'Main Nav')
 * @returns {Array|Object|null}
 */
export const getMenuLinks = (menuName) => {
  try {
    const link = getTemaLink('menu', menuName);
    if (!link) return null;

    return typeof link.valor === 'string' ? JSON.parse(link.valor) : link.valor;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`[Tema] Erro ao parsear menu '${menuName}':`, error);
    return null;
  }
};

// ============================================================================
// CONTEÚDOS
// ============================================================================

/**
 * Recupera todos os conteúdos do tema
 * @returns {Array<TemaConteudoItem>}
 */
export const getTemaConteudos = () => {
  try {
    const tema = getTemaAtivoMemoria();
    return tema?.conteudos || [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[Tema] Erro ao recuperar conteúdos:', error);
    return [];
  }
};

/**
 * Obtém conteúdo específico por tipo e categoria
 * @param {string} tipo - Tipo (ex: 'hero', 'banner', 'faq')
 * @param {string} categoria - Categoria do conteúdo
 * @returns {TemaConteudoItem|null}
 */
export const getTemaConteudo = (tipo, categoria) => {
  const conteudos = getTemaConteudos();
  return conteudos.find((c) => c.tipo === tipo && c.categoria === categoria) || null;
};

/**
 * Obtém todos os conteúdos de uma categoria
 * @param {string} categoria - Categoria do conteúdo
 * @returns {Array<TemaConteudoItem>}
 */
export const getTemaConteudosByCategoria = (categoria) => {
  const conteudos = getTemaConteudos();
  return conteudos.filter((c) => c.categoria === categoria);
};

/**
 * Obtém todos os conteúdos de um tipo
 * @param {string} tipo - Tipo do conteúdo (ex: 'faq', 'oferta')
 * @returns {Array<TemaConteudoItem>}
 */
export const getTemaConteudosByTipo = (tipo) => {
  const conteudos = getTemaConteudos();
  return conteudos.filter((c) => c.tipo === tipo);
};

/**
 * Agrupa conteúdos por tipo e categoria
 * @returns {Object<string, Object<string, Array>>}
 */
export const getTemaConteudosGrouped = () => {
  const conteudos = getTemaConteudos();
  const grouped = {};

  conteudos.forEach((conteudo) => {
    if (!grouped[conteudo.tipo]) {
      grouped[conteudo.tipo] = {};
    }
    if (!grouped[conteudo.tipo][conteudo.categoria]) {
      grouped[conteudo.tipo][conteudo.categoria] = [];
    }
    grouped[conteudo.tipo][conteudo.categoria].push(conteudo);
  });

  return grouped;
};

// ============================================================================
// FEATURES
// ============================================================================

/**
 * Recupera todas as features do tema
 * @returns {Array<TemaFeatureItem>}
 */
export const getTemaFeatures = () => {
  try {
    const tema = getTemaAtivoMemoria();
    return tema?.features || [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[Tema] Erro ao recuperar features:', error);
    return [];
  }
};

/**
 * Obtém feature específica por nome
 * @param {string} nome - Nome da feature
 * @returns {TemaFeatureItem|null}
 */
export const getTemaFeature = (nome) => {
  const features = getTemaFeatures();
  return features.find((f) => f.nome === nome) || null;
};

/**
 * Verifica se feature está habilitada
 * @param {string} nome - Nome da feature
 * @returns {boolean}
 */
export const isFeatureEnabled = (nome) => {
  const feature = getTemaFeature(nome);
  return feature !== null;
};

/**
 * Obtém nomes de features habilitadas
 * @returns {Array<string>}
 */
export const getTemaFeaturesNames = () => {
  const features = getTemaFeatures();
  return features.map((f) => f.nome);
};

// ============================================================================
// CONFIGS
// ============================================================================

/**
 * Recupera todas as configurações do tema
 * @returns {Array<{id: string, chave: string, valor: string}>}
 */
export const getTemaConfigs = () => {
  try {
    const tema = getTemaAtivoMemoria();
    return tema?.configs || [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[Tema] Erro ao recuperar configs:', error);
    return [];
  }
};

/**
 * Obtém configuração específica por chave
 * @param {string} chave - Chave da configuração (ex: 'radius_sm', 'transition_fast')
 * @returns {{id: string, chave: string, valor: string}|null}
 */
export const getTemaConfig = (chave) => {
  const configs = getTemaConfigs();
  return configs.find((c) => c.chave === chave) || null;
};

/**
 * Obtém valor de configuração específica
 * @param {string} chave - Chave da configuração
 * @param {string} [fallback=''] - Valor padrão se não encontrado
 * @returns {string}
 */
export const getConfigValue = (chave, fallback = '') => {
  const config = getTemaConfig(chave);
  return config?.valor || fallback;
};

/**
 * Agrupa configurações em objeto chave-valor
 * @returns {Object<string, string>}
 */
export const getTemaConfigsGrouped = () => {
  const configs = getTemaConfigs();
  const grouped = {};

  configs.forEach((config) => {
    grouped[config.chave] = config.valor;
  });

  return grouped;
};

// ============================================================================
// PÁGINAS
// ============================================================================

/**
 * Recupera todas as páginas do tema
 * @returns {Array<TemaPaginaItem>}
 */
export const getTemaPaginas = () => {
  try {
    const tema = getTemaAtivoMemoria();
    return tema?.paginas || [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[Tema] Erro ao recuperar páginas:', error);
    return [];
  }
};

/**
 * Obtém página específica pelo caminho
 * @param {string} caminho - Caminho da página (ex: '/internet')
 * @returns {TemaPaginaItem|null}
 */
export const getTemaPaginaByCaminho = (caminho) => {
  const paginas = getTemaPaginas();

  // Normaliza e mapeia o caminho
  const caminhoNormalizado = caminho.toLowerCase();
  const caminhoMapeado = CAMINHO_MAP[caminhoNormalizado] || caminhoNormalizado;

  return paginas.find((p) => p.caminho.toLowerCase() === caminhoMapeado) || null;
};

/**
 * Obtém páginas que aparecem no menu
 * @returns {Array<TemaPaginaItem>}
 */
export const getTemasMenu = () => {
  const paginas = getTemaPaginas();
  return paginas
    .filter((p) => p.mostrarNoMenu)
    .sort((a, b) => (a.ordemMenu || DEFAULT_ORDER) - (b.ordemMenu || DEFAULT_ORDER));
};

// ============================================================================
// COMPONENTES
// ============================================================================

/**
 * Obtém componentes de uma página
 * @param {string} caminoPagina - Caminho da página
 * @returns {Array<TemaComponenteItem>}
 */
export const getTemaComponentesByPagina = (caminoPagina) => {
  const pagina = getTemaPaginaByCaminho(caminoPagina);
  const componentes = pagina?.componentes || [];

  // Filtra componentes habilitados
  const componentesFiltrados = componentes.filter(
    (c) => c.habilitado === true && c.habilitadoNaPagina === true
  );

  // Ordena por ordem
  return sortByOrdem(componentesFiltrados);
};

/**
 * Obtém componente específico de uma página
 * @param {string} caminoPagina - Caminho da página
 * @param {string} nomeComponente - Nome do componente
 * @returns {TemaComponenteItem|null}
 */
export const getTemaComponenteByNome = (caminoPagina, nomeComponente) => {
  const componentes = getTemaComponentesByPagina(caminoPagina);
  return componentes.find((c) => c.nome === nomeComponente) || null;
};

/**
 * Obtém elementos de um componente
 * @param {string} caminoPagina - Caminho da página
 * @param {string} nomeComponente - Nome do componente
 * @returns {Array<TemaElementoItem>}
 */
export const getTemaElementosByComponente = (caminoPagina, nomeComponente) => {
  const componente = getTemaComponenteByNome(caminoPagina, nomeComponente);
  const elementos = componente?.elementos || [];

  // Filtra elementos habilitados
  const elementosFiltrados = elementos.filter(
    (e) => e.habilitado === true && e.habilitadoNoComponente === true
  );

  // Ordena por ordem
  return sortByOrdem(elementosFiltrados);
};

// ============================================================================
// TIPOS (JSDoc)
// ============================================================================

/**
 * @typedef {Object} TemaResponse
 * @property {boolean} success - Se a requisição foi bem sucedida
 * @property {Object|null} data - Dados do tema
 * @property {string} [error] - Mensagem de erro
 */

/**
 * @typedef {Object} TemaCorItem
 * @property {string} categoria - Categoria da cor
 * @property {string} nome - Nome da cor
 * @property {string} valor - Valor hexadecimal
 */

/**
 * @typedef {Object} TemaImagemItem
 * @property {string} categoria - Categoria da imagem
 * @property {string} nome - Nome da imagem
 * @property {string} valor - URL ou Base64 da imagem
 */

/**
 * @typedef {Object} TemaTextoItem
 * @property {string} categoria - Categoria do texto
 * @property {string} chave - Chave do texto
 * @property {string} valor - Conteúdo do texto
 */

/**
 * @typedef {Object} TemaLinkItem
 * @property {string} categoria - Categoria do link
 * @property {string} nome - Nome do link
 * @property {string} valor - URL do link
 */

/**
 * @typedef {Object} TemaConteudoItem
 * @property {string} tipo - Tipo do conteúdo
 * @property {string} categoria - Categoria do conteúdo
 * @property {Object} dados - Dados do conteúdo
 */

/**
 * @typedef {Object} TemaFeatureItem
 * @property {string} nome - Nome da feature
 * @property {boolean} habilitado - Se está habilitada
 */

/**
 * @typedef {Object} TemaPaginaItem
 * @property {number} id - ID da página
 * @property {string} nome - Nome da página
 * @property {string} caminho - Caminho da página
 * @property {Array} componentes - Componentes da página
 */

/**
 * @typedef {Object} TemaComponenteItem
 * @property {number} id - ID do componente
 * @property {string} nome - Nome do componente
 * @property {boolean} habilitado - Se está habilitado globalmente
 * @property {boolean} habilitadoNaPagina - Se está habilitado na página
 * @property {number} ordem - Ordem de exibição
 * @property {Array} elementos - Elementos do componente
 */

/**
 * @typedef {Object} TemaElementoItem
 * @property {number} id - ID do elemento
 * @property {string} nome - Nome do elemento
 * @property {boolean} habilitado - Se está habilitado globalmente
 * @property {boolean} habilitadoNoComponente - Se está habilitado no componente
 * @property {number} ordem - Ordem de exibição
 */

// ============================================================================
// INICIALIZAÇÃO EARLY (antes do React montar)
// ============================================================================

/**
 * Aplica meta tags dinâmicas (título, favicon, description, theme-color)
 * @returns {boolean} True se aplicado com sucesso
 */
export const applyTemaMetaTags = () => {
  try {
    // 1. Aplicar título da página
    const pageTitle = getTexto('meta', 'pageTitle');
    if (pageTitle) {
      document.title = pageTitle;
    }

    // 2. Aplicar favicon
    const favicon = getImagem('meta', 'favicon');
    if (favicon) {
      // Remover favicon existente
      const existingFavicon = document.querySelector('link[rel="icon"]');
      if (existingFavicon) {
        existingFavicon.remove();
      }

      // Criar novo link para favicon
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = favicon;
      document.head.appendChild(link);
    }

    // 3. Aplicar meta description
    const pageDescription = getTexto('meta', 'pageDescription');
    if (pageDescription) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = pageDescription;
    }

    // 4. Aplicar theme-color (cor da barra do navegador mobile)
    const primaryColor = getTemaCor('primaria', 'principal') || getTemaCor('primary', 'main');
    if (primaryColor) {
      let themeColor = document.querySelector('meta[name="theme-color"]');
      if (!themeColor) {
        themeColor = document.createElement('meta');
        themeColor.name = 'theme-color';
        document.head.appendChild(themeColor);
      }
      themeColor.content = primaryColor;
    }

    // 5. Aplicar Open Graph tags para compartilhamento
    const companyName = getTexto('company', 'name') || pageTitle;
    if (companyName) {
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.content = companyName;
    }

    if (pageDescription) {
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement('meta');
        ogDesc.setAttribute('property', 'og:description');
        document.head.appendChild(ogDesc);
      }
      ogDesc.content = pageDescription;
    }

    // 6. Aplicar og:image (logo principal)
    const logoMain = getImagem('logos', 'main') || getImagem('logos', 'Main');
    if (logoMain) {
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      ogImage.content = logoMain;
    }

    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[Tema] Erro ao aplicar meta tags:', error);
    return false;
  }
};

/**
 * Inicializa o tema ANTES do React montar
 * @description Detecta tenant pelo domínio, busca tema da API e aplica cores CSS.
 *              Deve ser chamado no index.jsx ANTES de ReactDOM.createRoot().
 *
 * @async
 * @returns {Promise<{success: boolean, tenant: string, error?: string}>}
 *
 * @example
 * // index.jsx
 * import { initTemaEarly } from './servicos/tema';
 *
 * initTemaEarly().then(() => {
 *   const root = ReactDOM.createRoot(document.getElementById('root'));
 *   root.render(<App />);
 * });
 */
export const initTemaEarly = async () => {
  try {
    // 1. Detectar tenant pelo domínio
    const tenant = await detectTenant();

    // 2. Buscar tema do parceiro
    const resultado = await buscarOuCachearTemaParceiro(tenant);

    if (!resultado.success) {
      // eslint-disable-next-line no-console
      console.warn('[Tema] Falha ao buscar tema, usando fallback CSS');
      return { success: false, tenant, error: 'Falha ao buscar tema' };
    }

    // 3. Aplicar cores CSS no :root (sobrescreve fallback)
    applyTemaCoresCSS();

    // 4. Aplicar meta tags (título, favicon, description)
    applyTemaMetaTags();

    return { success: true, tenant };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Tema] Erro na inicialização early:', error);
    return { success: false, tenant: null, error: error.message };
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

const temaService = {
  // Inicialização
  initTemaEarly,
  applyTemaMetaTags,
  // API
  buscarTemaParceiro,
  buscarOuCachearTemaParceiro,
  // Cache
  cacheTemaParceiro,
  getTemaCached,
  clearTemaCacheForParceiro,
  clearAllTemaCache,
  // Parceiro
  getCurrentParceiroId,
  getCurrentParceiro,
  clearCurrentParceiro,
  // Cores
  getTemaCores,
  getTemaCor,
  getTemaCorsByCategoria,
  getTemaAtivas,
  getTemaCorsByComponente,
  getTemaCorByVariavelRef,
  getTemaCoresGrouped,
  applyTemaCoresCSS,
  // Imagens
  getTemaImagens,
  getTemaImagem,
  getImagem,
  getTemaImagensByCategoria,
  getTemaImagensGrouped,
  // Textos
  getTemaTextos,
  getTemaTexto,
  getTexto,
  getTemaTextosByCategoria,
  getTemaTextosGrouped,
  // Links
  getTemaLinks,
  getTemaLink,
  getLink,
  getTemaLinksByCategoria,
  getTemaLinksGrouped,
  getMenuLinks,
  // Conteúdos
  getTemaConteudos,
  getTemaConteudo,
  getTemaConteudosByCategoria,
  getTemaConteudosByTipo,
  getTemaConteudosGrouped,
  // Features
  getTemaFeatures,
  getTemaFeature,
  isFeatureEnabled,
  getTemaFeaturesNames,
  // Configs
  getTemaConfigs,
  getTemaConfig,
  getConfigValue,
  getTemaConfigsGrouped,
  // Páginas
  getTemaPaginas,
  getTemaPaginaByCaminho,
  getTemasMenu,
  // Componentes
  getTemaComponentesByPagina,
  getTemaComponenteByNome,
  getTemaElementosByComponente,
};

export default temaService;

export { CACHE_TTL, STORAGE_KEY_PARCEIRO, CAMINHO_MAP, DEFAULT_ORDER };
