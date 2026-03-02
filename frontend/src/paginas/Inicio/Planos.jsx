/**
 * ============================================================================
 * Planos - Página de Catálogo de Planos
 * ============================================================================
 * @module paginas/Inicio/Planos
 * @description Página principal de exibição de todos os planos disponíveis.
 *              Apresenta comparativo de planos com preços e benefícios.
 *
 * @example
 * // Uso em rotas
 * <Route path="/planos" element={<Planos />} />
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

// Estilos
import styles from '../../estilos/paginas/OfertasChips.module.css';

// ============================================================================
// CONSTANTES
// ============================================================================

/** @constant {string} PAGE_PATH - Caminho da página no sistema */
const PAGE_PATH = '/planos';

/**
 * @constant {Object} CUSTOM_WRAPPERS - Mapeamento de wrappers customizados
 * @property {string} mainContent - Estilo para conteúdo principal
 * @property {string} faixa - Estilo para faixa de destaque
 */
const CUSTOM_WRAPPERS = Object.freeze({
  mainContent: styles.mainContent,
  faixa: styles.faixa,
});

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Página de catálogo de planos
 * @returns {JSX.Element} Página renderizada dinamicamente
 */
const Planos = () => {
  useLocationGuard();

  return <DynamicPageRenderer pagePath={PAGE_PATH} customWrappers={CUSTOM_WRAPPERS} />;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Planos;
export { PAGE_PATH, CUSTOM_WRAPPERS };
