/**
 * @file Serviço de Tema - Dinâmico por Parceiro
 * @description Gerencia título da página, favicon e cores do tema
 *              do parceiro logado. Busca dados da API pública.
 *
 * @module servicos/tema
 */

/**
 * Obtém o parceiroId (da URL, localStorage ou default)
 * @returns {string} ID do parceiro
 */
const getParceiroId = () => {
  // 1. Tentar from URL query params
  const urlParams = new URLSearchParams(window.location.search);
  const parceiroFromUrl = urlParams.get('parceiroId');
  if (parceiroFromUrl) return parceiroFromUrl;

  // 2. Tentar do localStorage (salvo durante login)
  const parceiroFromStorage = localStorage.getItem('parceiroId');
  if (parceiroFromStorage) return parceiroFromStorage;

  // 3. Default
  return '550e8400-e29b-41d4-a716-446655440001'; // Oni Telecom
};

/**
 * Converte Base64 para Data URL
 * @param {string} base64 - String em base64
 * @returns {string} Data URL
 */
const converterBase64ToDataUrl = (base64) => {
  if (!base64) return '';

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
 * Busca e aplica tema dinâmico ANTES do React montar
 * Obtém título, favicon e cores do parceiro via API
 *
 * @async
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const initTemaEarly = async () => {
  try {
    const parceiroId = getParceiroId();
    const apiUrl = import.meta.env.VITE_API_URL;

    // Buscar tema do parceiro
    const response = await fetch(`${apiUrl}/public/parceiros/${parceiroId}/tema`);

    if (!response.ok) {
      throw new Error(`Erro ao buscar tema: ${response.status}`);
    }

    const temaData = await response.json();

    if (!temaData.success) {
      throw new Error(temaData.error || 'Erro ao buscar tema');
    }

    const tema = temaData.data;

    // 1. Aplicar título da página
    const pageTitle =
      tema.textos?.find((txt) => txt.categoria === 'meta' && txt.chave === 'pageTitle')?.valor ||
      'Admin Panel';

    document.title = pageTitle;

    // 2. Aplicar favicon
    const favicon = tema.imagens?.find((img) => img.categoria === 'meta' && img.nome === 'favicon');

    if (favicon) {
      const faviconDataUrl = converterBase64ToDataUrl(favicon.valor);

      // Remover favicon existente
      const existingFavicon = document.querySelector('link[rel="icon"]');
      if (existingFavicon) {
        existingFavicon.remove();
      }

      // Criar novo link para favicon
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = faviconDataUrl;
      document.head.appendChild(link);
    }

    // 3. Aplicar meta description
    const pageDescription = tema.textos?.find(
      (txt) => txt.categoria === 'meta' && txt.chave === 'pageDescription'
    )?.valor;

    if (pageDescription) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = pageDescription;
    }

    // 4. Aplicar theme-color (cor da barra mobile)
    const primaryColor = tema.cores?.find(
      (cor) => cor.categoria === 'primaria' && cor.nome === 'Roxo Principal'
    )?.valor;

    if (primaryColor) {
      let themeColor = document.querySelector('meta[name="theme-color"]');
      if (!themeColor) {
        themeColor = document.createElement('meta');
        themeColor.name = 'theme-color';
        document.head.appendChild(themeColor);
      }
      themeColor.content = primaryColor;
    }

    return { success: true };
  } catch (error) {
    console.warn('[Tema] Erro ao inicializar tema dinâmico:', error);
    // Não falha completamente, deixa os defaults do HTML
    return { success: false, error: error.message };
  }
};

export default { initTemaEarly };
