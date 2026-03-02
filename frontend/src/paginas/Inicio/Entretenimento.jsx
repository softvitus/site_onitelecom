/**
 * ============================================================================
 * Entretenimento - Página de Serviços de Streaming e Mídia
 * ============================================================================
 * @module paginas/Inicio/Entretenimento
 * @description Página dedicada a apresentar serviços de streaming e entretenimento
 *              incluídos nos planos, como Netflix, HBO Max, Disney+, etc.
 *
 * @example
 * // Uso em rotas
 * <Route path="/entretenimento" element={<Entretenimento />} />
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
const PAGE_PATH = '/entretenimento';

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Página de serviços de entretenimento e streaming
 * @returns {JSX.Element} Página renderizada dinamicamente
 */
const Entretenimento = () => {
  useLocationGuard();

  return <DynamicPageRenderer pagePath={PAGE_PATH} />;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Entretenimento;
export { PAGE_PATH };
