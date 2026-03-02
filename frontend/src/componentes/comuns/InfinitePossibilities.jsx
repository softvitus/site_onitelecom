/**
 * @fileoverview Componente InfinitePossibilities - Seção de parceiros/logos
 * @component
 * @description
 * Renderiza uma seção com logos de parceiros/serviços:
 * - Título da seção
 * - Linha decorativa
 * - Grid de logos com animação de entrada
 * @returns {React.ReactElement} Seção de possibilidades infinitas
 */

import React, { useEffect, useRef, useCallback } from 'react';
import styles from '../../estilos/componentes/comuns/InfinitePossibilities.module.css';
import { getTexto, getTemaImagensByCategoria } from '../../servicos/tema';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🔧 EFEITOS
// ═════════════════════════════════════════════════════════════════════════════════════

/** @constant {string} ID da seção para navegação via âncora */
const SECTION_ID = 'infinite-possibilities';

/** @constant {number} Delay base para animação (em segundos) */
const ANIMATION_DELAY = 0;

// ═════════════════════════════════════════════════════════════════════════════════════
// 🛠️  FUNÇÕES AUXILIARES
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Aplica animação de entrada escalonada nas imagens
 * @param {HTMLElement} container - Container com as imagens
 * @param {string} showClass - Classe CSS para exibir
 */
const applyStaggeredAnimation = (container, showClass) => {
  if (!container) return;

  const images = container.querySelectorAll('img');
  let delay = 0;

  images.forEach((img) => {
    img.style.transitionDelay = `${delay}s`;
    img.classList.add(showClass);
    delay += ANIMATION_DELAY;
  });
};

/**
 * Obtém os logos e suas descrições do tema
 * @returns {Array<Object>} Array com {src, alt}
 */
const getLogosData = () => {
  const imagens = getTemaImagensByCategoria('infinitePossibilities');
  return imagens.map((img, index) => ({
    src: img.valor || '',
    alt: img.descricao || `Logo parceiro ${index + 1}`,
  }));
};

// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * SectionHeader - Título da seção com linha decorativa
 * @returns {React.ReactElement}
 */
const SectionHeader = () => (
  <>
    <h1 className="mb-4" role="heading" aria-level="1">
      {getTexto('infinitePossibilities', 'titulo', 'Possibilidades Infinitas')}
    </h1>
    <div className={styles['line-custom']} aria-hidden="true" />
  </>
);

/**
 * LogoItem - Item individual de logo
 * @param {Object} props - Props do componente
 * @param {string} props.src - URL da imagem
 * @param {string} props.alt - Texto alternativo
 * @returns {React.ReactElement}
 */
const LogoItem = ({ src, alt }) => <img src={src} alt={alt} className="img-fluid" loading="lazy" />;

/**
 * LogosGrid - Grid de logos dos parceiros
 * @param {Object} props - Props do componente
 * @param {React.RefObject} props.containerRef - Referência do container
 * @param {Array<Object>} props.logos - Lista de logos
 * @returns {React.ReactElement}
 */
const LogosGrid = ({ containerRef, logos }) => (
  <div
    className={`${styles['logos-custom']} mt-4`}
    ref={containerRef}
    role="img"
    aria-label="Logos dos parceiros e serviços"
  >
    {logos.map((logo, index) => (
      <LogoItem key={index} src={logo.src} alt={logo.alt} />
    ))}
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════════════
// 📱 COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Componente InfinitePossibilities - Seção de parceiros e possibilidades
 * @returns {React.ReactElement}
 */
const InfinitePossibilities = () => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // REFS
  // ─────────────────────────────────────────────────────────────────────────────────

  const logosRef = useRef(null);

  // ─────────────────────────────────────────────────────────────────────────────────
  // DATA
  // ─────────────────────────────────────────────────────────────────────────────────

  const logos = getLogosData();

  // ─────────────────────────────────────────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Aplica animação de entrada nos logos quando o componente monta
   */
  useEffect(() => {
    applyStaggeredAnimation(logosRef.current, styles.show);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────────

  return (
    <div
      id={SECTION_ID}
      className={styles['container-custom']}
      role="region"
      aria-labelledby="infinite-possibilities-title"
    >
      <div className="row">
        <div className="col-12">
          {/* Título e linha decorativa */}
          <SectionHeader />

          {/* Grid de logos */}
          <LogosGrid containerRef={logosRef} logos={logos} />
        </div>
      </div>
    </div>
  );
};

export default InfinitePossibilities;
