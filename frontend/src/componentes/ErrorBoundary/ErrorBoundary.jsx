/**
 * @fileoverview ErrorBoundary - Captura erros em componentes filhos
 * @component
 * @description
 * Componente de classe que captura erros JavaScript em qualquer
 * lugar da árvore de componentes filhos, registra esses erros
 * e exibe uma UI de fallback em vez da árvore que quebrou.
 */

import React, { Component } from 'react';

/**
 * ErrorBoundary - Captura e trata erros de renderização
 * @class
 * @extends Component
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Atualiza o estado quando um erro é capturado
   * @param {Error} error - O erro capturado
   * @returns {Object} Novo estado
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * Registra informações do erro para debugging
   * @param {Error} error - O erro capturado
   * @param {Object} errorInfo - Informações adicionais do erro
   */
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Log para serviço de monitoramento (ex: Sentry)
    // Em produção, enviar para serviço de logging
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrar com serviço de monitoramento
      // logger.error({ error, errorInfo });
    } else {
      console.error('ErrorBoundary capturou um erro:', error);
      console.error('Informações do componente:', errorInfo);
    }
  }

  /**
   * Reseta o estado de erro para tentar novamente
   */
  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Renderiza fallback customizado se fornecido
      if (fallback) {
        return typeof fallback === 'function'
          ? fallback({ error, retry: this.handleRetry })
          : fallback;
      }

      // UI de fallback padrão
      return (
        <div style={styles.container}>
          <div style={styles.content}>
            <div style={styles.icon}>⚠️</div>
            <h1 style={styles.title}>Algo deu errado</h1>
            <p style={styles.description}>
              Ocorreu um erro inesperado. Nossa equipe foi notificada.
            </p>
            <div style={styles.actions}>
              <button onClick={this.handleRetry} style={styles.buttonPrimary}>
                Tentar novamente
              </button>
              <button onClick={() => (window.location.href = '/')} style={styles.buttonSecondary}>
                Voltar ao início
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && error && (
              <details style={styles.details}>
                <summary style={styles.summary}>Detalhes técnicos</summary>
                <pre style={styles.pre}>{error.toString()}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}

// Estilos inline para fallback (não depende de CSS externo)
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fafafa',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: '2rem',
  },
  content: {
    textAlign: 'center',
    maxWidth: '480px',
  },
  icon: {
    fontSize: '4rem',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '0.75rem',
  },
  description: {
    fontSize: '1rem',
    color: '#737373',
    marginBottom: '2rem',
    lineHeight: '1.6',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  buttonPrimary: {
    padding: '0.75rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#fff',
    background: '#1a1a1a',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  buttonSecondary: {
    padding: '0.75rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#1a1a1a',
    background: 'transparent',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  details: {
    marginTop: '2rem',
    textAlign: 'left',
  },
  summary: {
    cursor: 'pointer',
    color: '#737373',
    fontSize: '0.875rem',
  },
  pre: {
    marginTop: '1rem',
    padding: '1rem',
    background: '#f5f5f5',
    borderRadius: '8px',
    fontSize: '0.75rem',
    overflow: 'auto',
    color: '#dc2626',
  },
};

export default ErrorBoundary;
