/**
 * ============================================================================
 * MonteSeuPlano - Página de Personalização de Planos
 * ============================================================================
 * @module paginas/Inicio/MonteSeuPlano
 * @description Página interativa para o cliente montar seu próprio plano,
 *              escolhendo serviços, velocidades e benefícios.
 *
 * @example
 * // Uso em rotas
 * <Route path="/monte-seu-plano" element={<MonteSeuPlano />} />
 *
 * @see DynamicPageRenderer - Componente base de renderização
 * @see useLocationGuard - Hook de proteção por localização
 */

// ============================================================================
// IMPORTS
// ============================================================================

// React
import React from 'react';

// Componentes
import DynamicPageRenderer from '../../componentes/DynamicPageRenderer/DynamicPageRenderer';

// Hooks
import useLocationGuard from '../../hooks/useLocationGuard';

// ============================================================================
// CONSTANTES
// ============================================================================

/** @constant {string} PAGE_PATH - Caminho da página no sistema */
const PAGE_PATH = '/monteseuplano';

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Página de personalização de planos
 * @returns {JSX.Element} Página renderizada dinamicamente
 */
const MonteSeuPlano = () => {
  useLocationGuard();

  return <DynamicPageRenderer pagePath={PAGE_PATH} />;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default MonteSeuPlano;
export { PAGE_PATH };
