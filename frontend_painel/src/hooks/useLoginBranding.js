/**
 * @file Hook para carregamento de branding na página de login
 * @description Busca dados de tema e logo via API pública
 * 
 * @module hooks/useLoginBranding
 */

import { useState, useEffect } from 'react';

/**
 * Converte Base64 para Data URL
 * @private
 * @param {string} base64
 * @returns {string}
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
 * Hook para carregar branding da página de login
 * @param {string} parceiroId - ID do parceiro (pode estar em query param ou ser padrão)
 * @returns {Object} { logo, nomeParceiro, carregando, erro, carregarBreanding }
 * 
 * @example
 * const { logo, nomeParceiro, carregando } = useLoginBranding(parceiroId);
 */
export const useLoginBranding = (parceiroId) => {
  const [logo, setLogo] = useState(null);
  const [nomeParceiro, setNomeParceiro] = useState('Site Oni');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const carregarBreanding = async (id) => {
    if (!id) return;

    try {
      setCarregando(true);
      setErro(null);

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${apiUrl}/public/parceiros/${id}/tema`);

      if (!response.ok) {
        throw new Error(`Erro ao buscar tema: ${response.status}`);
      }

      const temaData = await response.json();

      if (!temaData.success) {
        throw new Error(temaData.error || 'Erro ao buscar tema');
      }

      const tema = temaData.data;

      // Encontrar a logo principal
      const logoObj = tema.imagens?.find(
        (img) => img.categoria === 'logos' && img.nome?.toLowerCase() === 'main'
      );

      // Fallback: se não encontrar 'main', pegar a primeira logo
      const logoFallback = logoObj || tema.imagens?.find((img) => img.categoria === 'logos');

      const logoDataUrl = logoFallback ? converterBase64ToDataUrl(logoFallback.valor) : null;

      setLogo(logoDataUrl);
      setNomeParceiro(tema.parceiro?.nome || 'Site Oni');
    } catch (error) {
      console.error('[useLoginBranding] Erro ao carregar branding:', error);
      setErro(error.message);
      // Não interrompe o login, apenas não mostra a logo
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (parceiroId) {
      carregarBreanding(parceiroId);
    }
  }, [parceiroId]);

  return {
    logo,
    nomeParceiro,
    carregando,
    erro,
    carregarBreanding,
  };
};

export default useLoginBranding;
