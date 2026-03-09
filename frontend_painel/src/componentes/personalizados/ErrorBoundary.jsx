/**
 * @file Error Boundary para Captura de Erros
 * @description Componente que captura erros durante renderização de
 * componentes filhos e exibe interface de recuperação
 *
 * @module componentes/personalizados/ErrorBoundary
 */

import { Component } from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import '../../estilos/componentes/personalizados/ErrorBoundary.css';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Error Boundary
 *
 * Componente que captura erros JavaScript em qualquer parte da árvore
 * de componentes filhos, registra esses erros e exibe uma interface
 * de fallback ao invés de renderizar a árvore quebrada.
 *
 * @component
 * @class
 * @param {Object} props
 * @param {ReactNode} props.children - Componentes filhos a proteger
 * @returns {JSX.Element}
 *
 * @example
 * <ErrorBoundary>
 *   <MeuComponenteProbematico />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <h1 className="error-boundary-title">
            <FiAlertCircle size={32} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Algo
            deu errado
          </h1>
          <p className="error-boundary-message">
            {this.state.error?.message || 'Um erro inesperado ocorreu.'}
          </p>
          <button onClick={() => window.location.reload()} className="error-boundary-button">
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
