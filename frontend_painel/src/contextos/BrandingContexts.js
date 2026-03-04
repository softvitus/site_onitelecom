import { createContext, useContext } from 'react';

/**
 * Context para Branding/Tema
 */
export const BrandingContext = createContext();

/**
 * Hook para usar BrandingContext
 * @returns {Object} Objeto com branding do parceiro
 */
export const useBreanding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBreanding deve ser usado dentro de BrandingProvider');
  }
  return context;
};
