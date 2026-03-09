/**
 * ============================================================================
 * Internet - Página de Planos de Internet Fibra
 * ============================================================================
 * @module paginas/Inicio/Internet
 * @description Página dedicada a exibir planos de internet fibra óptica.
 *              Inclui faixas de velocidades, preços e benefícios.
 *
 * @example
 * // Uso em rotas
 * <Route path="/internet" element={<Internet />} />
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
const PAGE_PATH = '/internet';

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Página de planos de internet fibra óptica
 * @returns {JSX.Element} Página renderizada dinamicamente
 */
const Internet = () => {
  useLocationGuard();

  return <DynamicPageRenderer pagePath={PAGE_PATH} />;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Internet;
export { PAGE_PATH };
