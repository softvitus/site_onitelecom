/**
 * @fileoverview BrandingContext - Contexto de Branding/Tema para Admin
 * @description Gerencia o tema, cores, imagens e dados de branding do parceiro
 *              Busca dados via API pública (/public/parceiros/:id/tema)
 * 
 * @module contextos/BrandingContext
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';

// ============================================================================
// CONTEXTO
// ============================================================================

// eslint-disable-next-line react-refresh/only-export-components
export const BrandingContext = createContext();

// ============================================================================
// PROVIDER
// ============================================================================

/**
 * BrandingProvider - Fornece contexto de branding para a aplicação
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes filhos
 * @returns {React.ReactElement}
 */
export const BrandingProvider = ({ children }) => {
  const { usuario, isLoading: authLoading } = useAuth();

  // Estado do branding
  const [branding, setBreanding] = useState({
    parceiro: null,      // Dados do parceiro
    tema: null,          // Tema completo
    logo: null,          // URL da logo principal
    logoTipo: 'image',   // 'image' ou 'text'
    nomeParceiro: 'Site Oni',
    cores: {},           // Cores do tema
    imagens: [],         // Imagens do tema
    textos: {},          // Textos do tema
    paginas: [],         // Páginas do tema
  });

  const [_loading, setLoading] = useState(false);
  const [_erro, setErro] = useState(null);
  const [requestInProgress, setRequestInProgress] = useState(false);

  /**
   * Busca dados do tema do parceiro via API pública
   * Memoizada com useCallback para evitar re-renderizações desnecessárias
   */
  const carregarBreanding = useCallback(async (parceiroId) => {
    if (!parceiroId) {
      console.warn('[BrandingContext] Nenhum ID de parceiro fornecido');
      return;
    }

    // Evitar múltiplas requisições simultâneas
    if (requestInProgress) {
      console.warn('[BrandingContext] Requisição já em progresso');
      return;
    }

    try {
      setRequestInProgress(true);
      setLoading(true);
      setErro(null);

      // Buscar tema via endpoint público
      const apiUrl = globalThis.process?.env?.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(
        `${apiUrl}/public/parceiros/${parceiroId}/tema`
      );

      if (!response.ok) {
        throw new Error(`Erro ao buscar tema: ${response.status}`);
      }

      const temaData = await response.json();

      if (!temaData.success) {
        throw new Error(temaData.error || 'Erro ao buscar tema');
      }

      const tema = temaData.data;
      const parceiro = tema.parceiro || {};

      // 3. Processar logo
      const logoObj = tema.imagens?.find(
        (img) => img.categoria === 'logos' && img.nome?.toLowerCase() === 'main'
      );
      const logo = logoObj ? converterBase64ToDataUrl(logoObj.valor) : null;

      // 4. Processar cores
      const coresGrouped = {};
      tema.cores?.forEach((cor) => {
        if (!coresGrouped[cor.categoria]) {
          coresGrouped[cor.categoria] = {};
        }
        coresGrouped[cor.categoria][cor.nome] = cor.valor;
      });

      // 5. Processar imagens em mapa
      const imagensMap = {};
      tema.imagens?.forEach((img) => {
        if (!imagensMap[img.categoria]) {
          imagensMap[img.categoria] = {};
        }
        imagensMap[img.categoria][img.nome] = converterBase64ToDataUrl(img.valor);
      });

      // 6. Processar textos em mapa
      const textosMap = {};
      tema.textos?.forEach((txt) => {
        if (!textosMap[txt.categoria]) {
          textosMap[txt.categoria] = {};
        }
        textosMap[txt.categoria][txt.chave] = txt.valor;
      });

      // 7. Atualizar estado
      setBreanding({
        parceiro,
        tema,
        logo,
        logoTipo: logo ? 'image' : 'text',
        nomeParceiro: parceiro?.nome || 'Site Oni',
        cores: coresGrouped,
        imagens: imagensMap,
        textos: textosMap,
        paginas: tema.paginas || [],
      });

      localStorage.setItem('lastParceiroLoaded', parceiroId);
      console.log('[BrandingContext] Branding carregado com sucesso:', parceiro?.nome);
    } catch (error) {
      console.error('[BrandingContext] Erro ao carregar branding:', error);
      setErro(error.message);
    } finally {
      setLoading(false);
      setRequestInProgress(false);
    }
  }, [requestInProgress]);

  /**
   * Obtém cor do tema
   * @param {string} categoria - Categoria da cor
   * @param {string} nome - Nome da cor
   * @returns {string} Valor da cor (hex)
   */
  const getCor = (categoria, nome, fallback = '#000000') => {
    return branding.cores[categoria]?.[nome] || fallback;
  };

  /**
   * Obtém imagem do tema
   * @param {string} categoria - Categoria
   * @param {string} nome - Nome
   * @returns {string} URL da imagem
   */
  const getImagem = (categoria, nome, fallback = '') => {
    return branding.imagens[categoria]?.[nome] || fallback;
  };

  /**
   * Obtém texto do tema
   * @param {string} categoria - Categoria
   * @param {string} chave - Chave
   * @returns {string} Valor do texto
   */
  const getTexto = (categoria, chave, fallback = '') => {
    return branding.textos[categoria]?.[chave] || fallback;
  };

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
   * Carrega branding quando usuário é definido
   * Apenas uma vez por parceiroId
   */
  useEffect(() => {
    if (!authLoading && usuario?.usu_par_id) {
      const lastLoaded = localStorage.getItem('lastParceiroLoaded');
      
      // Apenas carrega se é um parceiroId diferente
      if (lastLoaded !== usuario.usu_par_id) {
        carregarBreanding(usuario.usu_par_id);
      }
    }
  }, [usuario?.usu_par_id, authLoading, carregarBreanding]);

  const value = {
    // Estado
    branding,
    loading: _loading,
    erro: _erro,

    // Dados principais
    logo: branding.logo,
    logoTipo: branding.logoTipo,
    nomeParceiro: branding.nomeParceiro,
    parceiroAtivo: branding.parceiro,

    // Funções
    carregarBreanding,
    getCor,
    getImagem,
    getTexto,
  };

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
};

export default BrandingContext;
// eslint-disable-next-line react-refresh/only-export-components
/**
 * Hook para usar BrandingContext
 * @returns {Object} Objeto com branding do parceiro
 */
export const useBreanding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBreanding deve ser usado dentro de BrandingProvider');
  }
  return context;
};
