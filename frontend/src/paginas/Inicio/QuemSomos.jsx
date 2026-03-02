/**
 * ============================================================================
 * QuemSomos - Página Institucional da Empresa
 * ============================================================================
 * @module paginas/Inicio/QuemSomos
 * @description Página institucional que apresenta a história, missão, visão
 *              e valores da empresa, além de informações de contato.
 *
 * @example
 * // Uso em rotas
 * <Route path="/quem-somos" element={<QuemSomos />} />
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
const PAGE_PATH = '/quemsomos';

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Página institucional "Quem Somos"
 * @returns {JSX.Element} Página renderizada dinamicamente
 */
const QuemSomos = () => {
  useLocationGuard();

  return <DynamicPageRenderer pagePath={PAGE_PATH} />;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default QuemSomos;
export { PAGE_PATH };
