/**
 * @fileoverview Testes do componente ErrorBoundary
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../componentes/ErrorBoundary/ErrorBoundary';

// Componente que propositalmente lança um erro
const ProblematicComponent = ({ shouldError }) => {
  if (shouldError) {
    throw new Error('Erro de teste');
  }
  return <div>Componente funcionando</div>;
};

describe('ErrorBoundary', () => {
  // Silencia console.error durante os testes
  // eslint-disable-next-line no-console
  const originalError = console.error;
  beforeAll(() => {
    // eslint-disable-next-line no-console
    console.error = jest.fn();
  });
  afterAll(() => {
    // eslint-disable-next-line no-console
    console.error = originalError;
  });

  it('renderiza children quando não há erro', () => {
    render(
      <ErrorBoundary>
        <div>Conteúdo normal</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Conteúdo normal')).toBeInTheDocument();
  });

  it('exibe UI de fallback quando há erro', () => {
    render(
      <ErrorBoundary>
        <ProblematicComponent shouldError={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
    expect(screen.getByText(/Ocorreu um erro inesperado/)).toBeInTheDocument();
  });

  it('exibe botões de ação na UI de fallback', () => {
    render(
      <ErrorBoundary>
        <ProblematicComponent shouldError={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Tentar novamente')).toBeInTheDocument();
    expect(screen.getByText('Voltar ao início')).toBeInTheDocument();
  });

  it('renderiza fallback customizado quando fornecido', () => {
    const customFallback = <div>Fallback customizado</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ProblematicComponent shouldError={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Fallback customizado')).toBeInTheDocument();
  });

  it('mostra botão tentar novamente quando há erro', () => {
    render(
      <ErrorBoundary>
        <ProblematicComponent shouldError={true} />
      </ErrorBoundary>
    );

    // Verifica que está mostrando erro
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();

    // Verifica que o botão de retry está presente e é clicável
    const retryButton = screen.getByText('Tentar novamente');
    expect(retryButton).toBeInTheDocument();
    expect(retryButton.tagName).toBe('BUTTON');
  });

  it('mostra botão voltar ao início quando há erro', () => {
    render(
      <ErrorBoundary>
        <ProblematicComponent shouldError={true} />
      </ErrorBoundary>
    );

    const homeButton = screen.getByText('Voltar ao início');
    expect(homeButton).toBeInTheDocument();
    expect(homeButton.tagName).toBe('BUTTON');
  });
});
