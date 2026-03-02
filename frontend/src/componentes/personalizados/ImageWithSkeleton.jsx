/**
 * ============================================================================
 * ImageWithSkeleton - Componente de Imagem com Skeleton Loader
 * ============================================================================
 *
 * Exibe uma imagem com skeleton loader animado durante o carregamento.
 * Proporciona uma experiência visual suave enquanto a imagem é carregada.
 *
 * Características:
 * - Skeleton com animação shimmer durante carregamento
 * - Transição suave ao mostrar a imagem
 * - Suporte a loading="eager" para imagens prioritárias
 * - Props flexíveis para customização de estilos
 *
 * @module componentes/personalizados/ImageWithSkeleton
 * @requires react
 * @requires hooks/useImageLoader
 *
 * @example
 * // Uso básico
 * <ImageWithSkeleton src="/logo.png" alt="Logo" />
 *
 * @example
 * // Com classes customizadas
 * <ImageWithSkeleton
 *   src="/banner.jpg"
 *   alt="Banner"
 *   className={styles.bannerImage}
 *   containerClassName={styles.bannerContainer}
 *   onLoad={() => console.log('Carregou!')}
 * />
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';

// ----------------------------------------------------------------------------
// Hooks
// ----------------------------------------------------------------------------
import useImageLoader from '../../hooks/useImageLoader';

// ----------------------------------------------------------------------------
// Estilos
// ----------------------------------------------------------------------------
import styles from '../../estilos/componentes/personalizados/ImageWithSkeleton.module.css';

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Imagem com skeleton loader durante carregamento
 * @component
 * @param {Object} props - Props do componente
 * @param {string} props.src - URL da imagem
 * @param {string} [props.alt='Imagem'] - Texto alternativo
 * @param {string} [props.className=''] - Classes CSS para a imagem
 * @param {string} [props.containerClassName=''] - Classes CSS para o container
 * @param {Function} [props.onLoad=null] - Callback quando imagem carrega
 */
const ImageWithSkeleton = memo(
  ({
    src = '',
    alt = 'Imagem',
    className = '',
    containerClassName = '',
    onLoad = null,
    ...props
  }) => {
    // Hook para controle de estado de carregamento
    const { imageLoaded, shouldShowSkeleton } = useImageLoader(src);

    // Determinar classe CSS baseada no estado de carregamento
    const imageClassName = `${className} ${imageLoaded ? styles.loaded : styles.loading}`;

    return (
      <div className={`${styles.container} ${containerClassName}`}>
        {/* Skeleton Loader */}
        {shouldShowSkeleton && (
          <div
            className={`${styles.skeleton} ${className}`}
            aria-hidden="true"
            role="presentation"
          />
        )}

        {/* Imagem */}
        {src && (
          <img
            src={src}
            alt={alt}
            className={imageClassName}
            loading="eager"
            decoding="sync"
            onLoad={onLoad}
            {...props}
          />
        )}
      </div>
    );
  }
);

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

ImageWithSkeleton.displayName = 'ImageWithSkeleton';

// ============================================================================
// PROP TYPES
// ============================================================================

ImageWithSkeleton.propTypes = {
  /** URL ou base64 da imagem */
  src: PropTypes.string,
  /** Texto alternativo para acessibilidade */
  alt: PropTypes.string,
  /** Classes CSS adicionais para a imagem */
  className: PropTypes.string,
  /** Classes CSS para o container wrapper */
  containerClassName: PropTypes.string,
  /** Callback executado quando a imagem termina de carregar */
  onLoad: PropTypes.func,
};

// Valores padrão definidos diretamente nos parâmetros da função (linha 61-66)

// ============================================================================
// EXPORTS
// ============================================================================

export { ImageWithSkeleton };
export default ImageWithSkeleton;
