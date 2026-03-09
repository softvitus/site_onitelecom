/**
 * ============================================================================
 * Inicio - Página Inicial do Site
 * ============================================================================
 *
 * Página principal que renderiza dinamicamente os componentes configurados
 * no backend para a rota "/". Inclui carrossel de imagens com suporte a
 * versões desktop e mobile.
 *
 * Características:
 * - Proteção por localização (redireciona se não selecionada)
 * - Carrossel dinâmico com imagens da API
 * - Wrappers customizados para espaçamento de componentes
 * - Renderização dinâmica via DynamicPageRenderer
 *
 * @module paginas/Inicio/Inicio
 * @requires react
 * @requires componentes/DynamicPageRenderer
 * @requires hooks/useLocationGuard
 *
 * @example
 * // Uso no App.jsx
 * import Inicio from './paginas/Inicio/Inicio';
 * <Route path="/" element={<Inicio />} />
 */

import React, { useMemo } from 'react';

// ----------------------------------------------------------------------------
// Componentes
// ----------------------------------------------------------------------------
import DynamicPageRenderer from '../../componentes/DynamicPageRenderer/DynamicPageRenderer';

// ----------------------------------------------------------------------------
// Hooks
// ----------------------------------------------------------------------------
import useLocationGuard from '../../hooks/useLocationGuard';

// ----------------------------------------------------------------------------
// Serviços
// ----------------------------------------------------------------------------
import { getTemaImagensByCategoria } from '../../servicos/tema';

// ============================================================================
// CONSTANTES
// ============================================================================

/** Caminho da página no sistema de rotas */
const PAGE_PATH = '/';

/** Intervalo de troca do carrossel em ms */
const CAROUSEL_INTERVAL = 5000;

/** Categoria de imagens do carrossel na API */
const CAROUSEL_CATEGORY = 'carousel';

// ============================================================================
// WRAPPERS DE ESPAÇAMENTO
// ============================================================================

/**
 * Classes CSS para wrappers de espaçamento
 * Definidas como <style> tag no componente
 */
const CUSTOM_WRAPPERS = Object.freeze({
  ofertas: 'inicio-ofertas',
  appExclusivo: 'inicio-app-exclusivo',
  telefoniaBanner: 'inicio-telefonia-banner',
  contato: 'inicio-contato',
});

/**
 * Estilos CSS para wrappers
 * Injetados via <style> tag no componente
 */
const WRAPPERS_STYLES = `
  .inicio-ofertas {
    margin-bottom: 5rem;
  }

  .inicio-app-exclusivo {
    padding: 1.6rem;
    margin-top: 1.6rem;
    margin-bottom: 1.6rem;
  }

  .inicio-telefonia-banner {
    margin-top: 2rem;
    margin-bottom: 2rem;
  }

  .inicio-contato {
    margin-bottom: 0rem;
  }

  @media (max-width: 768px) {
    .inicio-app-exclusivo {
      padding: 0.9rem;
      margin-top: 0.6rem;
      margin-bottom: 0.6rem;
    }

    .inicio-telefonia-banner {
      margin-top: 1rem;
      margin-bottom: 1rem;
    }
  }
`;

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Filtra imagens por tipo (desktop ou mobile) baseado no nome
 * @param {Array} imagens - Array de imagens da API
 * @param {'desktop'|'mobile'} tipo - Tipo de imagem a filtrar
 * @returns {string[]} Array de URLs/base64 das imagens ordenadas
 */
const filtrarImagensPorTipo = (imagens, tipo) => {
  if (!Array.isArray(imagens) || imagens.length === 0) {
    return [];
  }

  const filtros = {
    desktop: (nome) => nome.includes('desktop') || nome.startsWith('slide'),
    mobile: (nome) => nome.includes('mob') || nome.includes('mobile'),
  };

  const filtro = filtros[tipo];
  if (!filtro) return [];

  return imagens
    .filter((img) => {
      const nome = (img.nome || '').toLowerCase();
      return filtro(nome);
    })
    .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
    .map((img) => img.valor);
};

/**
 * Obtém as imagens do carrossel separadas por tipo
 * @returns {{ desktop: string[], mobile: string[] }} Imagens organizadas
 */
const getCarouselImages = () => {
  const imagens = getTemaImagensByCategoria(CAROUSEL_CATEGORY) || [];

  return {
    desktop: filtrarImagensPorTipo(imagens, 'desktop'),
    mobile: filtrarImagensPorTipo(imagens, 'mobile'),
  };
};

// ============================================================================
// CONFIGURAÇÃO DE WRAPPERS
// ============================================================================

/**
 * Página inicial do site
 * @component
 */
const Inicio = () => {
  // --------------------------------------------------------------------------
  // Proteção de Rota
  // --------------------------------------------------------------------------
  useLocationGuard();

  // --------------------------------------------------------------------------
  // Dados Memoizados
  // --------------------------------------------------------------------------

  /** Imagens do carrossel (desktop e mobile) */
  const carouselImages = useMemo(() => getCarouselImages(), []);

  /** Props customizadas para o componente carrossel */
  const customProps = useMemo(
    () => ({
      carousel: {
        images: carouselImages.desktop,
        mobileImages: carouselImages.mobile,
        interval: CAROUSEL_INTERVAL,
      },
    }),
    [carouselImages]
  );

  // --------------------------------------------------------------------------
  // Renderização
  // --------------------------------------------------------------------------

  return (
    <>
      <style>{WRAPPERS_STYLES}</style>
      <DynamicPageRenderer
        pagePath={PAGE_PATH}
        customWrappers={CUSTOM_WRAPPERS}
        customProps={customProps}
      />
    </>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Inicio;

/**
 * Utilitários exportados para testes ou uso externo
 */
export { getCarouselImages, filtrarImagensPorTipo, CUSTOM_WRAPPERS, PAGE_PATH, CAROUSEL_INTERVAL };
