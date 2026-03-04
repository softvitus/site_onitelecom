/**
 * ============================================================================
 * useLocationGuard - Hook de Proteção por Localização
 * ============================================================================
 *
 * Hook customizado que verifica se o usuário selecionou uma localização válida.
 * Redireciona automaticamente para /entrada se não houver localização.
 *
 * Uso:
 * - Substitui o useEffect duplicado em todas as páginas
 * - Centraliza a lógica de verificação de localização
 * - Retorna status para controle condicional se necessário
 *
 * @module hooks/useLocationGuard
 * @requires react
 * @requires react-router-dom
 *
 * @example
 * // Uso básico (redireciona automaticamente)
 * const Pagina = () => {
 *   useLocationGuard();
 *   return <div>Conteúdo da página</div>;
 * };
 *
 * @example
 * // Uso com verificação de status
 * const Pagina = () => {
 *   const { hasLocation, isChecking } = useLocationGuard();
 *   if (isChecking) return <Loading />;
 *   return <div>Conteúdo</div>;
 * };
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// ============================================================================
// CONSTANTES
// ============================================================================

/** Chave do localStorage para localização */
const STORAGE_KEY = 'selectedLocation';

/** Rota de redirecionamento quando não há localização */
const REDIRECT_PATH = '/entrada';

/** Flag de desenvolvimento (desabilitado para console limpo) */
const IS_DEV = false;

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Logger condicional (apenas em desenvolvimento)
 * @param {string} message - Mensagem
 */
const log = (message) => {
  if (IS_DEV) {
    // eslint-disable-next-line no-console

    console.log(`[LocationGuard] ${message}`);
  }
};

/**
 * Verifica se existe localização válida no localStorage
 * @returns {boolean} True se localização é válida
 */
const verificarLocalizacao = () => {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return false;
    }

    const parsed = JSON.parse(storedValue);
    return parsed && typeof parsed === 'object' && (parsed.city || parsed.label);
  } catch {
    return false;
  }
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook que protege páginas verificando localização selecionada
 * @param {Object} options - Opções do hook
 * @param {boolean} [options.redirect=true] - Se deve redirecionar automaticamente
 * @returns {{ hasLocation: boolean, isChecking: boolean }} Status da verificação
 */
const useLocationGuard = (options = {}) => {
  const { redirect = true } = options;
  const navigate = useNavigate();

  const [hasLocation, setHasLocation] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  /**
   * Verifica localização ao montar
   */
  const checkLocation = useCallback(() => {
    const locationExists = verificarLocalizacao();
    setHasLocation(locationExists);
    setIsChecking(false);

    if (!locationExists) {
      log('Localizacao nao encontrada');
      if (redirect) {
        log(`Redirecionando para ${REDIRECT_PATH}`);
        navigate(REDIRECT_PATH, { replace: true });
      }
    } else {
      log('Localizacao valida encontrada');
    }
  }, [navigate, redirect]);

  useEffect(() => {
    checkLocation();
  }, [checkLocation]);

  return {
    /** Se existe localização válida (null enquanto verifica) */
    hasLocation,
    /** Se está verificando localização */
    isChecking,
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

export default useLocationGuard;
export { useLocationGuard, verificarLocalizacao, STORAGE_KEY, REDIRECT_PATH };

