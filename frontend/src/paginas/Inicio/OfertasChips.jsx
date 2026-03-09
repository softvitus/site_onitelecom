/**
 * ============================================================================
 * OfertasChips - Página de Ofertas de Chips Móveis
 * ============================================================================
 * @module paginas/Inicio/OfertasChips
 * @description Página dedicada a exibir ofertas de chips pré-pagos e controle.
 *              Apresenta planos móveis com dados, minutos e benefícios.
 *
 * @example
 * // Uso em rotas
 * <Route path="/ofertas-chips" element={<OfertasChips />} />
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
const PAGE_PATH = '/ofertaschips';

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Página de ofertas de chips móveis
 * @returns {JSX.Element} Página renderizada dinamicamente
 */
const OfertasChips = () => {
  useLocationGuard();

  return <DynamicPageRenderer pagePath={PAGE_PATH} />;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default OfertasChips;
export { PAGE_PATH };
