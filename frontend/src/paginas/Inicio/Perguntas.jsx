/**
 * ============================================================================
 * Perguntas - Página de Perguntas Frequentes (FAQ)
 * ============================================================================
 * @module paginas/Inicio/Perguntas
 * @description Página dedicada a responder dúvidas frequentes dos clientes
 *              sobre planos, serviços, instalação e suporte.
 *
 * @example
 * // Uso em rotas
 * <Route path="/perguntas-frequentes" element={<Perguntas />} />
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
const PAGE_PATH = '/perguntasfrequentes';

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Página de perguntas frequentes (FAQ)
 * @returns {JSX.Element} Página renderizada dinamicamente
 */
const Perguntas = () => {
  useLocationGuard();

  return <DynamicPageRenderer pagePath={PAGE_PATH} />;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Perguntas;
export { PAGE_PATH };
