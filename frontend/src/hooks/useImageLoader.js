/**
 * ============================================================================
 * useImageLoader - Hook de Carregamento de Imagens com Cache
 * ============================================================================
 * @module hooks/useImageLoader
 * @description Hook customizado para carregamento otimizado de imagens.
 *              Implementa cache em memória, skeleton loader e tratamento de erros.
 *
 * @features
 * - Cache em memória com TTL configurável
 * - Skeleton loader profissional
 * - Preload otimizado
 * - Fallback seguro para erros
 * - Limpeza automática de listeners
 *
 * @example
 * // Uso básico
 * const { imageLoaded, isLoading, shouldShowSkeleton } = useImageLoader(imageUrl);
 *
 * @example
 * // Com fallback
 * const { imageLoaded, imageError } = useImageLoader(imageUrl, fallbackUrl);
 * if (imageError) return <img src={fallbackUrl} />;
 *
 * @example
 * // Com opções customizadas
 * const { imageLoaded } = useImageLoader(imageUrl, null, { maxAge: 3600000 });
 *
 * @see ImageWithSkeleton - Componente que utiliza este hook
 */

// ============================================================================
// IMPORTS
// ============================================================================

// React
import { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================================
// CONSTANTES
// ============================================================================

/** @constant {number} DEFAULT_CACHE_MAX_AGE - Tempo padrão de cache (1 hora) */
const DEFAULT_CACHE_MAX_AGE = 1000 * 60 * 60;

/** @constant {boolean} IS_DEV - Flag de ambiente de desenvolvimento */

// ============================================================================
// CACHE
// ============================================================================

/**
 * Cache de imagens em memória com TTL
 * @namespace ImageCache
 */
const ImageCache = {
  /** @type {Map<string, {data: string, timestamp: number}>} */
  store: new Map(),

  /**
   * Armazena uma imagem no cache
   * @param {string} key - Chave única da imagem
   * @param {string} value - URL da imagem
   */
  set(key, value) {
    this.store.set(key, {
      data: value,
      timestamp: Date.now(),
    });
  },

  /**
   * Recupera uma imagem do cache
   * @param {string} key - Chave única da imagem
   * @param {number} [maxAge=DEFAULT_CACHE_MAX_AGE] - Idade máxima em ms
   * @returns {string|null} URL da imagem ou null se expirado/inexistente
   */
  get(key, maxAge = DEFAULT_CACHE_MAX_AGE) {
    const cached = this.store.get(key);

    if (!cached) return null;

    const age = Date.now() - cached.timestamp;

    if (age >= maxAge) {
      this.store.delete(key);
      return null;
    }

    return cached.data;
  },

  /**
   * Verifica se uma imagem está em cache
   * @param {string} key - Chave única da imagem
   * @returns {boolean}
   */
  has(key) {
    return this.store.has(key);
  },

  /**
   * Remove uma imagem do cache
   * @param {string} key - Chave única da imagem
   */
  delete(key) {
    this.store.delete(key);
  },

  /**
   * Limpa todo o cache
   */
  clear() {
    this.store.clear();
  },

  /**
   * Retorna o tamanho atual do cache
   * @returns {number}
   */
  get size() {
    return this.store.size;
  },
};

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Logger condicional (desabilitado)
 * @param {string} _message - Mensagem (não utilizada)
 * @param {'log'|'warn'|'error'} [_level='log'] - Nível do log (não utilizado)
 */
const log = (_message, _level = 'log') => {
  // Logs desabilitados para produção
};

/**
 * Gera chave única para cache baseada na URL
 * @param {string} src - URL da imagem
 * @returns {string} Chave do cache
 */
const generateCacheKey = (src) => `img_${src}`;

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook para carregamento otimizado de imagens
 * @param {string|null} imageSrc - URL da imagem a carregar
 * @param {string|null} [defaultSrc=null] - URL de fallback em caso de erro
 * @param {UseImageLoaderOptions} [options={}] - Opções de configuração
 * @returns {UseImageLoaderResult} Estado do carregamento
 */
export const useImageLoader = (imageSrc, defaultSrc = null, options = {}) => {
  const { maxAge = DEFAULT_CACHE_MAX_AGE } = options;

  // ---------------------------------------------------------------------------
  // Estado
  // ---------------------------------------------------------------------------
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(!!imageSrc);
  const [currentSrc, setCurrentSrc] = useState(imageSrc);

  // ---------------------------------------------------------------------------
  // Refs
  // ---------------------------------------------------------------------------
  const imageRef = useRef(null);
  const abortRef = useRef(false);

  // ---------------------------------------------------------------------------
  // Callbacks
  // ---------------------------------------------------------------------------

  /**
   * Reseta o estado do loader
   */
  const reset = useCallback(() => {
    setImageLoaded(false);
    setImageError(false);
    setIsLoading(!!imageSrc);
  }, [imageSrc]);

  // ---------------------------------------------------------------------------
  // Efeitos
  // ---------------------------------------------------------------------------

  useEffect(() => {
    // Sem imagem para carregar
    if (!imageSrc) {
      setIsLoading(false);
      setImageLoaded(false);
      return;
    }

    // Reset para novo carregamento
    abortRef.current = false;
    setIsLoading(true);
    setImageError(false);
    setCurrentSrc(imageSrc);

    const cacheKey = generateCacheKey(imageSrc);

    // Verificar cache
    const cachedImage = ImageCache.get(cacheKey, maxAge);
    if (cachedImage) {
      log(`Cache hit: ${imageSrc}`);
      setImageLoaded(true);
      setIsLoading(false);
      return;
    }

    // Pré-carregar imagem
    const img = new Image();

    const handleLoad = () => {
      if (abortRef.current) return;

      ImageCache.set(cacheKey, imageSrc);
      setImageLoaded(true);
      setIsLoading(false);
      log(`Loaded: ${imageSrc}`);
    };

    const handleError = () => {
      if (abortRef.current) return;

      log(`Error loading: ${imageSrc}`, 'warn');
      setImageError(true);
      setIsLoading(false);

      // Usar fallback se disponível
      if (defaultSrc) {
        setCurrentSrc(defaultSrc);
      }
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = imageSrc;

    // Cleanup
    return () => {
      abortRef.current = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [imageSrc, defaultSrc, maxAge]);

  // ---------------------------------------------------------------------------
  // Retorno
  // ---------------------------------------------------------------------------

  return {
    /** Se a imagem foi carregada com sucesso */
    imageLoaded,
    /** Se está carregando */
    isLoading,
    /** Se houve erro no carregamento */
    imageError,
    /** Se deve mostrar skeleton (loading && !loaded) */
    shouldShowSkeleton: isLoading && !imageLoaded,
    /** URL atual (original ou fallback) */
    currentSrc,
    /** Ref para elemento de imagem */
    imageRef,
    /** Função para resetar o estado */
    reset,
  };
};

// ============================================================================
// TIPOS (JSDoc)
// ============================================================================

/**
 * @typedef {Object} UseImageLoaderOptions
 * @property {number} [maxAge=3600000] - Idade máxima do cache em ms
 */

/**
 * @typedef {Object} UseImageLoaderResult
 * @property {boolean} imageLoaded - Se a imagem foi carregada
 * @property {boolean} isLoading - Se está carregando
 * @property {boolean} imageError - Se houve erro
 * @property {boolean} shouldShowSkeleton - Se deve mostrar skeleton
 * @property {string|null} currentSrc - URL atual da imagem
 * @property {React.RefObject} imageRef - Ref para o elemento img
 * @property {function} reset - Função para resetar estado
 */

// ============================================================================
// EXPORTS
// ============================================================================

export default useImageLoader;
export { ImageCache, DEFAULT_CACHE_MAX_AGE, generateCacheKey };
