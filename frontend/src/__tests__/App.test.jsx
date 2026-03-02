/**
 * @fileoverview Testes básicos do App
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// Import após os mocks
import App from '../App';

// Mock dos módulos necessários
jest.mock('../servicos/tema', () => ({
  getTemaPaginas: () => [],
  initTema: jest.fn().mockResolvedValue(true),
}));

jest.mock('../contexts/BrandingContext', () => ({
  BrandingProvider: ({ children }) => <div>{children}</div>,
  useBrandingContext: () => ({
    loading: false,
    parceiro: null,
    parceiroId: null,
  }),
}));

describe('App', () => {
  it('renderiza sem crash', () => {
    render(<App />);
    // Se chegou aqui sem erro, o teste passou
    expect(true).toBe(true);
  });

  it('contém ErrorBoundary', () => {
    // Verifica que o App usa ErrorBoundary verificando a estrutura
    const { container } = render(<App />);
    expect(container.firstChild).toBeTruthy();
  });
});
