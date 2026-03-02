/**
 * ============================================================================
 * LocationRoute - Rota Protegida por Localização
 * ============================================================================
 *
 * Componente HOC (Higher-Order Component) que protege rotas verificando
 * se o usuário selecionou uma localização válida no localStorage.
 * Redireciona para /entrada caso não haja localização.
 *
 * Fluxo:
 * 1. Verifica localStorage por 'selectedLocation'
 * 2. Se não existe ou é inválido → redireciona para /entrada
 * 3. Se existe e é válido → renderiza o elemento filho
 *
 * @module componentes/ProtectedRoute/LocationRoute
 * @requires react
 * @requires react-router-dom
 *
 * @example
 * // No App.jsx ou roteador
 * import LocationRoute from './componentes/ProtectedRoute/LocationRoute';
 *
 * <Route
 *   path="/"
 *   element={<LocationRoute element={<Inicio />} />}
 * />
 *
 * @example
 * // Com componente inline
 * <LocationRoute element={<Dashboard user={user} />} />
 */

import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

// ----------------------------------------------------------------------------
// Serviços
// ----------------------------------------------------------------------------
import { getTexto } from '../../servicos/tema';

// ============================================================================
// CONSTANTES
// ============================================================================

/** Chave do localStorage para localização */
const STORAGE_KEY = 'selectedLocation';

/** Rota de redirecionamento quando não há localização */
const REDIRECT_PATH = '/entrada';

/** Estados possíveis de verificação */
const LOCATION_STATUS = Object.freeze({
  CHECKING: null,
  VALID: true,
  INVALID: false,
});

/** Flag de desenvolvimento */
const IS_DEV = process.env.NODE_ENV === 'development';

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Logger condicional (apenas em desenvolvimento)
 * @param {'info'|'warn'|'error'|'success'} type - Tipo de log
 * @param {string} message - Mensagem
 */
const log = (type, message) => {
  if (!IS_DEV) return;

  const prefixes = {
    info: '[INFO]',
    warn: '[WARN]',
    error: '[ERROR]',
    success: '[OK]',
  };

  const prefix = prefixes[type] || '[LOG]';
  const logFn = type === 'error' ? console.error : type === 'warn' ? console.warn : console.log;
  logFn(`${prefix} LocationRoute: ${message}`);
};

/**
 * Verifica se existe localização válida no localStorage
 * @returns {boolean} True se localização é válida
 */
const verificarLocalizacaoNoStorage = () => {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      log('warn', 'Nenhuma localizacao encontrada no storage');
      return false;
    }

    const parsed = JSON.parse(storedValue);

    // Validar estrutura mínima esperada
    const isValid = parsed && typeof parsed === 'object' && (parsed.city || parsed.label);

    if (isValid) {
      log('success', `Localizacao valida: ${parsed.label || parsed.city}`);
    } else {
      log('warn', 'Localizacao com estrutura invalida');
    }

    return isValid;
  } catch (error) {
    log('error', `Erro ao parsear localizacao: ${error.message}`);
    return false;
  }
};

// ============================================================================
// SUB-COMPONENTES
// ============================================================================

/**
 * Componente de loading durante verificação
 * @component
 */
const LoadingState = memo(() => {
  const loadingText = getTexto('locationSelector', 'carregando', 'Carregando...');

  const containerStyle = useMemo(
    () => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      padding: '40px',
      textAlign: 'center',
      color: '#666',
      fontSize: '1rem',
    }),
    []
  );

  return (
    <div style={containerStyle} role="status" aria-live="polite">
      {loadingText}
    </div>
  );
});

LoadingState.displayName = 'LocationRoute.LoadingState';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Rota protegida que requer localização selecionada
 * @component
 * @param {Object} props - Props do componente
 * @param {React.ReactElement} props.element - Elemento a ser renderizado se autorizado
 */
const LocationRoute = memo(({ element }) => {
  // --------------------------------------------------------------------------
  // Hooks
  // --------------------------------------------------------------------------
  const navigate = useNavigate();

  // --------------------------------------------------------------------------
  // Estado
  // --------------------------------------------------------------------------

  /** Status da verificação de localização */
  const [locationStatus, setLocationStatus] = useState(LOCATION_STATUS.CHECKING);

  // --------------------------------------------------------------------------
  // Callbacks
  // --------------------------------------------------------------------------

  /**
   * Verifica localização ao montar o componente
   */
  const checkLocation = useCallback(() => {
    const hasValidLocation = verificarLocalizacaoNoStorage();
    setLocationStatus(hasValidLocation ? LOCATION_STATUS.VALID : LOCATION_STATUS.INVALID);
  }, []);

  // --------------------------------------------------------------------------
  // Efeitos
  // --------------------------------------------------------------------------

  // Verificar localização ao montar
  useEffect(() => {
    checkLocation();
  }, [checkLocation]);

  // Redirecionar se localização inválida
  useEffect(() => {
    if (locationStatus === LOCATION_STATUS.INVALID) {
      log('info', `Redirecionando para ${REDIRECT_PATH}`);
      navigate(REDIRECT_PATH, { replace: true });
    }
  }, [locationStatus, navigate]);

  // --------------------------------------------------------------------------
  // Renderização
  // --------------------------------------------------------------------------

  // Estado de verificação em andamento
  if (locationStatus === LOCATION_STATUS.CHECKING) {
    return <LoadingState />;
  }

  // Localização válida - renderizar elemento
  if (locationStatus === LOCATION_STATUS.VALID) {
    return element;
  }

  // Localização inválida - não renderiza nada (redirecionamento em andamento)
  return null;
});

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

LocationRoute.displayName = 'LocationRoute';

// ============================================================================
// PROP TYPES
// ============================================================================

LocationRoute.propTypes = {
  /** Elemento React a ser renderizado quando localização é válida */
  element: PropTypes.element.isRequired,
};

// ============================================================================
// EXPORTS
// ============================================================================

export default LocationRoute;

/**
 * Utilitários exportados para testes ou uso externo
 */
export { verificarLocalizacaoNoStorage, STORAGE_KEY, REDIRECT_PATH, LOCATION_STATUS };
