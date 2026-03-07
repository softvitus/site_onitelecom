/**
 * @fileoverview Componente AppExclusivo - Seção promocional do aplicativo Onigo
 * @component
 * @description
 * Renderiza uma seção promocional do app exclusivo com:
 * - Banner superior com logo e link
 * - Imagem demonstrativa das telas do app
 * - Controles de mídia ilustrativos
 * - Texto destacado de funcionalidades
 * @returns {React.ReactElement} Seção do app exclusivo
 */

import React from 'react';
import styles from '../../estilos/componentes/comuns/AppExclusivo.module.css';
import { getTexto, getImagem, getLink } from '../../servicos/tema';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🔧 EFEITOS
// ═════════════════════════════════════════════════════════════════════════════════════

/** @constant {string} ID da seção para navegação via âncora */
const SECTION_ID = 'app-exclusivo';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🛠️  FUNÇÕES AUXILIARES
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Formata o texto do banner com destaque
 * @param {string} bannerText - Texto completo do banner
 * @param {string} highlightText - Texto a destacar
 * @returns {Object} Objeto com partes do texto {before, highlight, after}
 */
const formatBannerText = (bannerText, highlightText) => {
  const parts = bannerText.split(highlightText);
  return {
    before: parts[0] || '',
    highlight: highlightText,
    after: parts[1] || '',
  };
};

// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * LeftColumn - Coluna esquerda com imagem e texto do banner
 * @returns {React.ReactElement}
 */
const LeftColumn = () => {
  const bannerText = getTexto('appExclusivo', 'banner', '');
  const bannerParts = formatBannerText(bannerText, 'App Exclusivo');

  return (
    <div className={styles['left-column']}>
      {/* Imagem das telas */}
      <div className={styles['image-wrapper']}>
        <img
          src={getImagem('appExclusivo', 'telas', '')}
          alt="Telas do aplicativo Onigo em diversos dispositivos"
          className="img-fluid"
          loading="lazy"
        />
      </div>

      {/* Texto do banner */}
      <div className={styles['banner-text']}>
        <a href={getLink('externa', 'Portal Onigo', '#')} aria-label="Acessar portal Onigo">
          {bannerParts.before}
          <strong>{getTexto('appExclusivo', 'destaque', 'App Exclusivo')}</strong>
          {bannerParts.after}
        </a>
      </div>
    </div>
  );
};

/**
 * RightColumn - Coluna direita com logo, título e features
 * @returns {React.ReactElement}
 */
const RightColumn = () => {
  const fullTitle = getTexto('appExclusivo', 'titulo', 'O melhor da TV pra você curtir a qualquer hora e em qualquer lugar.');
  
  return (
    <div className={styles['right-column']}>
      {/* Logo + Título inline */}
      <div className={styles['header-section']}>
        <img
          src={getImagem('appExclusivo', 'logo', '')}
          alt="Logo Onigo"
          className={styles['logo-img']}
          loading="lazy"
        />
        <span className={styles['title']}>{fullTitle}</span>
      </div>

      {/* Carrossel de features */}
      <FeaturesCarousel />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * FeaturesCarousel - Carrossel animado com ícones e textos
 * @returns {React.ReactElement}
 */
const FeaturesCarousel = () => {
  const features = [
    { icon: getImagem('appExclusivo', 'controles_play', ''), text: getTexto('appExclusivo', 'feature_play', 'Assista') },
    { icon: getImagem('appExclusivo', 'controles_pause', ''), text: getTexto('appExclusivo', 'feature_pause', 'Pause') },
    { icon: getImagem('appExclusivo', 'controles_retroceder', ''), text: getTexto('appExclusivo', 'feature_grave', 'Grave') },
    { icon: getImagem('appExclusivo', 'controles_avancar', ''), text: getTexto('appExclusivo', 'feature_quando', 'Quando quiser') },
  ];

  // Duplicar para loop infinito
  const duplicatedFeatures = [...features, ...features];

  return (
    <div className={styles['carousel-wrapper']}>
      <div className={styles['carousel-track']}>
        {duplicatedFeatures.map((item, index) => (
          <div key={index} className={styles['carousel-item']}>
            <img src={item.icon} alt={item.text} className={styles['carousel-icon']} />
            <span className={styles['carousel-text']}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════════════
// 📱 COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Componente AppExclusivo - Seção promocional do aplicativo
 * @returns {React.ReactElement}
 */
const AppExclusivo = () => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────────

  return (
    <div
      id={SECTION_ID}
      className={styles['oni-theme-variables']}
     
      aria-labelledby="app-exclusivo-title"
    >
      <div className="container">
        <div className={styles['main-content']}>
          {/* Coluna esquerda - Imagem + Banner */}
          <LeftColumn />

          {/* Coluna direita - Logo + Título + Features */}
          <RightColumn />
        </div>
      </div>
    </div>
  );
};

export default AppExclusivo;

