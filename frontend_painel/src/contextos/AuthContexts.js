import { createContext, useContext } from 'react';

/**
 * Context para autenticação e permissões
 */
export const AuthContext = createContext();

/**
 * Hook para usar AuthContext
 * @returns {Object} Objeto com dados de autenticação
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
