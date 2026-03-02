/**
 * ============================================================================
 * Empresas - Página de Soluções para Empresas
 * ============================================================================
 * @module paginas/Inicio/Empresas
 * @description Página dedicada a exibir soluções e planos corporativos.
 *              Apresenta ofertas e serviços voltados para o segmento empresarial.
 *
 * @example
 * // Uso em rotas
 * <Route path="/para-empresas" element={<Empresas />} />
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
const PAGE_PATH = '/para-empresas';

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Página de soluções empresariais
 * @returns {JSX.Element} Página renderizada dinamicamente
 */
const Empresas = () => {
  useLocationGuard();

  return <DynamicPageRenderer pagePath={PAGE_PATH} />;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Empresas;
export { PAGE_PATH };
