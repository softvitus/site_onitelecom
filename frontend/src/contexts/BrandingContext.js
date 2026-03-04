/**
 * ============================================================================
 * BrandingContext - Gerenciamento Global de Branding
 * ============================================================================
 * @module contexts/BrandingContext
 * @description Context API para gerenciamento centralizado de branding multi-tenant.
 *              Fornece configuração, estado de loading e funções de controle
 *              para toda a aplicação.
 *
 * @example
 * // Envolver a aplicação com o Provider
 * import { BrandingProvider } from './contexts/BrandingContext';
 *
 * <BrandingProvider>
 *   <App />
 * </BrandingProvider>
 *
 * @example
 * // Usar em componentes
 * import { useBrandingContext } from './contexts/BrandingContext';
 *
 * const MeuComponente = () => {
 *   const { config, loading, parceiroId } = useBrandingContext();
 *   if (loading) return <Loading />;
 *   return <div>{config.empresa.nome}</div>;
 * };
 *
 * @see initializeConfig - Serviço de inicialização de configuração
 * @see detectTenant - Serviço de detecção de tenant
 */

// ============================================================================
// IMPORTS
// ============================================================================

// React
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

// Serviços
import {
  buscarOuCachearTemaParceiro,
  applyTemaCoresCSS,
  initializeConfig,
  detectTenant,
  getAllParceirosFromAPI,
} from '../servicos/tema';
import { checkApiHealth, isConnectionError } from '../servicos/api';

// ============================================================================
// CONSTANTES
// ============================================================================

/** @constant {number} MIN_LOADING_TIME - Tempo mínimo de loading em ms */
const MIN_LOADING_TIME = 5000;

/** @constant {string} CONTEXT_ERROR_MESSAGE - Mensagem de erro do contexto */
const CONTEXT_ERROR_MESSAGE = 'useBrandingContext deve ser usado dentro de BrandingProvider';

// ============================================================================
// CONTEXT
// ============================================================================

/**
 * Context de Branding
 * @type {React.Context<BrandingContextValue|null>}
 */
const BrandingContext = createContext(null);

// ============================================================================
// PROVIDER
// ============================================================================

/**
 * Provider do Branding Context
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Componentes filhos
 * @returns {JSX.Element} Provider com contexto de branding
 */
export const BrandingProvider = ({ children }) => {
  // ---------------------------------------------------------------------------
  // Estado
  // ---------------------------------------------------------------------------
  const [config, setConfig] = useState(null);
  const [parceiroId, setParceiroId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------------------------------------------------------------------------
  // Efeitos
  // ---------------------------------------------------------------------------

  /**
   * Redireciona para página de erro do servidor
   */
  const redirectToErrorPage = () => {
    window.location.href = '/50x.html';
  };

  /**
   * Inicializa o branding na primeira renderização
   * - Verifica conexão com API primeiro
   * - Detecta tenant atual
   * - Pré-carrega tema e imagens
   * - Carrega configuração do backend
   */
  useEffect(() => {
    const initBranding = async () => {
      try {
        setLoading(true);
        setError(null);

        // PRIMEIRO: Verificar se a API está acessível
        try {
          await checkApiHealth(8000); // 8 segundos de timeout
        } catch (healthError) {
          // eslint-disable-next-line no-console

          console.error('[BrandingContext] API não está acessível:', healthError.message);
          redirectToErrorPage();
          return;
        }

        // Detectar tenant
        const tenant = await detectTenant();
        setParceiroId(tenant);

        // Pré-carregar tema + garantir tempo mínimo de loading
        await Promise.all([
          buscarOuCachearTemaParceiro(tenant),
          new Promise((resolve) => setTimeout(resolve, MIN_LOADING_TIME)),
        ]);

        // Aplicar cores do tema da API como variáveis CSS
        applyTemaCoresCSS();

        // Carregar configuração do backend
        const result = await initializeConfig();

        if (result.success) {
          setConfig(result.config);
        } else {
          // Fallback para config vazio - tema vem da API via tema.js
          // eslint-disable-next-line no-console

          console.warn('[BrandingContext] initializeConfig falhou, usando config vazio');
          setConfig({});
        }
      } catch (err) {
        // eslint-disable-next-line no-console

        console.error('[BrandingContext] Erro ao inicializar branding:', err);
        
        // Se for erro de conexão com API, redireciona para página de erro
        if (isConnectionError(err)) {
          // eslint-disable-next-line no-console

          console.error('[BrandingContext] Erro de conexão com API - redirecionando para página de erro');
          redirectToErrorPage();
          return;
        }
        
        setConfig({});
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initBranding();
  }, []);

  // ---------------------------------------------------------------------------
  // Callbacks
  // ---------------------------------------------------------------------------

  /**
   * Troca para outro parceiro (redireciona para novo domínio)
   * @param {string|number} newParceiroId - ID do novo parceiro
   * @returns {Promise<void>}
   */
  const switchParceiro = useCallback(async (newParceiroId) => {
    try {
      const parceiros = await getAllParceirosFromAPI();
      const novoParceiro = parceiros.find((p) => p.id === newParceiroId);

      if (novoParceiro?.dominio) {
        window.location.href = novoParceiro.dominio;
      }
    } catch (err) {
      // eslint-disable-next-line no-console

      console.error('[BrandingContext] Erro ao trocar parceiro:', err);
    }
  }, []);

  /**
   * Revalida/atualiza configuração do backend
   * @returns {Promise<void>}
   */
  const refreshConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await initializeConfig();

      if (result.success) {
        setConfig(result.config);
        setParceiroId(result.tenant);
      }
    } catch (err) {
      // eslint-disable-next-line no-console

      console.error('[BrandingContext] Erro ao atualizar config:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Valor do Contexto (Memoizado)
  // ---------------------------------------------------------------------------

  const contextValue = useMemo(
    () => ({
      // Estado
      config,
      parceiroId,
      loading,
      error,
      // Ações
      switchParceiro,
      refreshConfig,
    }),
    [config, parceiroId, loading, error, switchParceiro, refreshConfig]
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return <BrandingContext.Provider value={contextValue}>{children}</BrandingContext.Provider>;
};

BrandingProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook principal para acessar o contexto de branding
 * @returns {BrandingContextValue} Valor do contexto
 * @throws {Error} Se usado fora do BrandingProvider
 *
 * @example
 * const { config, loading, switchParceiro } = useBrandingContext();
 */
export const useBrandingContext = () => {
  const context = useContext(BrandingContext);

  if (!context) {
    throw new Error(CONTEXT_ERROR_MESSAGE);
  }

  return context;
};

/**
 * Hook simplificado que retorna apenas a configuração
 * @returns {Object|null} Configuração do parceiro
 *
 * @example
 * const config = useBrandingConfig();
 * console.log(config?.empresa?.nome);
 */
export const useBrandingConfig = () => {
  const { config } = useBrandingContext();
  return config;
};

/**
 * Hook para verificar se está em um parceiro específico
 * @param {string|number} targetParceiroId - ID do parceiro a verificar
 * @returns {boolean} True se o parceiro ativo corresponde ao ID informado
 *
 * @example
 * const isTelecomPlus = useIsParceiro('telecomplus');
 * if (isTelecomPlus) {
 *   // Lógica específica para TelecomPlus
 * }
 */
export const useIsParceiro = (targetParceiroId) => {
  const { parceiroId } = useBrandingContext();
  return parceiroId === targetParceiroId;
};

/**
 * Hook para acessar apenas o estado de loading
 * @returns {boolean} Estado de loading
 *
 * @example
 * const isLoading = useBrandingLoading();
 */
export const useBrandingLoading = () => {
  const { loading } = useBrandingContext();
  return loading;
};

/**
 * Hook para acessar apenas o erro
 * @returns {string|null} Mensagem de erro ou null
 *
 * @example
 * const error = useBrandingError();
 * if (error) console.error(error);
 */
export const useBrandingError = () => {
  const { error } = useBrandingContext();
  return error;
};

// ============================================================================
// TIPOS (JSDoc)
// ============================================================================

/**
 * @typedef {Object} BrandingContextValue
 * @property {Object|null} config - Configuração do parceiro
 * @property {string|number|null} parceiroId - ID do parceiro ativo
 * @property {boolean} loading - Estado de carregamento
 * @property {string|null} error - Mensagem de erro
 * @property {function(string|number): Promise<void>} switchParceiro - Troca de parceiro
 * @property {function(): Promise<void>} refreshConfig - Atualiza configuração
 */

// ============================================================================
// EXPORTS
// ============================================================================

export default BrandingContext;
export { MIN_LOADING_TIME, CONTEXT_ERROR_MESSAGE };

