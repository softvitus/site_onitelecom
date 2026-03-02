import { useContext } from 'react';
import { AuthContext } from '../contextos/AuthContext';

/**
 * Hook para usar dados e funções de autenticação
 * Deve ser usado dentro de <AuthProvider>
 * @throws {Error} Se usado fora do AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }

  return context;
};

export default useAuth;
