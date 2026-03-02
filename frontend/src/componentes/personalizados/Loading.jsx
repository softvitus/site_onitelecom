/**
 * ============================================================================
 * Loading - Tela de Carregamento Minimalista
 * ============================================================================
 * @module componentes/personalizados/Loading
 * @description Tela de loading fullscreen com spinner animado.
 *              Cores dinâmicas via CSS variables globais (aplicadas por initTemaEarly).
 *
 * @features
 * - Spinner com animação pulse
 * - Cores dinâmicas via CSS variables (--color-primaria-roxo-principal)
 * - Responsivo (mobile-first)
 *
 * @example
 * // Uso básico
 * import Loading from './componentes/personalizados/Loading';
 *
 * if (loading) return <Loading />;
 */

import React, { memo } from 'react';

// ----------------------------------------------------------------------------
// Estilos
// ----------------------------------------------------------------------------
import styles from '../../estilos/componentes/personalizados/Loading.module.css';

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Tela de carregamento fullscreen
 * @component
 * @returns {JSX.Element} Tela de loading com spinner
 */
const Loading = memo(() => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingContent}>
        {/* Spinner Minimalista */}
        <div className={styles.spinnerContainer}>
          <div className={styles.spinner} />
          <div className={styles.spinner} />
          <div className={styles.spinner} />
          <div className={styles.spinner} />
          <div className={styles.spinner} />
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

Loading.displayName = 'Loading';

// ============================================================================
// EXPORTS
// ============================================================================

export default Loading;
