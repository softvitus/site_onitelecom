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

/**
 * Obtém os controles de mídia do tema
 * @returns {Array<Object>} Lista de controles com src e alt
 */
const getMediaControls = () => [
  { src: getImagem('appExclusivo', 'controles_play', ''), alt: 'Botão Play' },
  { src: getImagem('appExclusivo', 'controles_pause', ''), alt: 'Botão Pause' },
  { src: getImagem('appExclusivo', 'controles_retroceder', ''), alt: 'Botão Retroceder' },
  { src: getImagem('appExclusivo', 'controles_avancar', ''), alt: 'Botão Avançar' },
];

// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * TopBanner - Banner superior com logo e link
 * @returns {React.ReactElement}
 */
const TopBanner = () => {
  const bannerText = getTexto('appExclusivo', 'banner', '');
  const bannerParts = formatBannerText(bannerText, 'App Exclusivo');

  return (
    <div className={`container ${styles['top-banner']}`}>
      <div className={`row align-items-center mb-4 ${styles['banner-row']}`}>
        {/* Logo */}
        <div className={`col-md-3 text-center ${styles['banner-logo']}`}>
          <img
            src={getImagem('appExclusivo', 'logo', '')}
            alt="Logo Onigo"
            className={`${styles['img-fluid']} ${styles['logo-img']}`}
            loading="lazy"
          />
        </div>

        {/* Texto do banner com link */}
        <div className={`col-md-9 ${styles['banner-text']}`}>
          <a href={getLink('externa', 'Portal Onigo', '#')} aria-label="Acessar portal Onigo">
            {bannerParts.before}
            <strong>{getTexto('appExclusivo', 'destaque', 'App Exclusivo')}</strong>
            {bannerParts.after}
          </a>
        </div>
      </div>
    </div>
  );
};

/**
 * AppScreenshot - Imagem demonstrativa das telas do app
 * @returns {React.ReactElement}
 */
const AppScreenshot = () => (
  <div className={`col-md-6 mb-4 mb-md-0 ${styles['image-container']}`}>
    <div className={styles['image-wrapper']}>
      <img
        src={getImagem('appExclusivo', 'telas', '')}
        alt="Telas do aplicativo Onigo em diversos dispositivos"
        className="img-fluid"
        loading="lazy"
      />
    </div>
  </div>
);

/**
 * MediaControls - Controles de mídia ilustrativos
 * @returns {React.ReactElement}
 */
const MediaControls = () => {
  const controls = getMediaControls();

  return (
    <div
      className={`d-flex gap-3 ${styles['controls']}`}
      role="img"
      aria-label="Controles de mídia do aplicativo"
    >
      {controls.map((control, index) => (
        <img key={index} src={control.src} alt={control.alt} loading="lazy" />
      ))}
    </div>
  );
};

/**
 * FeaturesHighlight - Texto destacado de funcionalidades
 * @returns {React.ReactElement}
 */
const FeaturesHighlight = () => (
  <div className={styles['highlight']}>
    {getTexto('appExclusivo', 'feature_play', 'Assista')}
    <br />
    {getTexto('appExclusivo', 'feature_pause', 'Pause')}
    <br />
    {getTexto('appExclusivo', 'feature_grave', 'Grave')}
    <br />
    {getTexto('appExclusivo', 'feature_quando', 'Quando quiser')}
  </div>
);

/**
 * AppContent - Conteúdo principal com título, controles e destaques
 * @returns {React.ReactElement}
 */
const AppContent = () => (
  <div className={`col-md-6 ${styles['text-content']}`}>
    {/* Título */}
    <h1>{getTexto('appExclusivo', 'titulo', '')}</h1>

    {/* Controles de mídia */}
    <MediaControls />

    {/* Funcionalidades em destaque */}
    <FeaturesHighlight />
  </div>
);

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
      {/* Banner superior */}
      <TopBanner />

      {/* Conteúdo principal */}
      <div className="container">
        <div className={`row align-items-center ${styles['main-content']}`}>
          {/* Imagem das telas */}
          <AppScreenshot />

          {/* Conteúdo textual */}
          <AppContent />
        </div>
      </div>
    </div>
  );
};

export default AppExclusivo;

