/**
 * @fileoverview Componente Banner - Seção principal de apresentação com título, descrição e CTA
 * @component
 * @description
 * Renderiza um banner de apresentação com:
 * - Fundo decorativo com padrão de bolhas
 * - Título principal em destaque
 * - Subtítulo descritivo
 * - Botão de ação (CTA) para navegação
 * - Responsivo e acessível
 * @returns {React.ReactElement} Seção banner completa
 */

import React, { useCallback } from 'react';
import styles from '../../estilos/componentes/comuns/Banner.module.css';
import { getTexto } from '../../servicos/tema';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🔧 EFEITOS
// ═════════════════════════════════════════════════════════════════════════════════════

/** @constant {string} ID da seção para navegação via âncora */
const BANNER_SECTION_ID = 'banner';

/** @constant {string} ID do elemento para scroll */
const SCROLL_TARGET_ID = 'servicos';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🛠️  FUNÇÕES AUXILIARES
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Realiza scroll suave até o elemento alvo
 * @param {string} targetId - ID do elemento alvo
 */
const scrollToSection = (targetId) => {
  const element = document.getElementById(targetId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * BannerBackground - Fundo decorativo com padrão de bolhas
 * @returns {React.ReactElement}
 */
const BannerBackground = () => <div className={styles['bolinhas-banner']} aria-hidden="true" />;

/**
 * BannerTitle - Título principal do banner
 * @param {Object} props - Props do componente
 * @param {string} props.title - Texto do título
 * @returns {React.ReactElement}
 */
const BannerTitle = ({ title }) => (
  <h1 className="display-4" aria-level="1">
    {title}
  </h1>
);

/**
 * BannerSubtitle - Subtítulo descritivo
 * @param {Object} props - Props do componente
 * @param {string} props.subtitle - Texto do subtítulo
 * @returns {React.ReactElement}
 */
const BannerSubtitle = ({ subtitle }) => (
  <p className="lead" role="complementary">
    {subtitle}
  </p>
);

/**
 * BannerButton - Botão de ação (CTA)
 * @param {Object} props - Props do componente
 * @param {string} props.text - Texto do botão
 * @param {string} props.targetId - ID do elemento alvo para scroll
 * @param {Function} props.onClick - Callback ao clicar no botão
 * @returns {React.ReactElement}
 */
const BannerButton = ({ text, targetId, onClick }) => (
  <button
    className={`btn btn-lg ${styles['botao-oni']} mt-3`}
    onClick={onClick}
    aria-label={`Navegar para ${targetId}`}
  >
    {text}
  </button>
);

// ═════════════════════════════════════════════════════════════════════════════════════
// 📱 COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Componente Banner - Seção de apresentação principal
 * @returns {React.ReactElement}
 */
const Banner = () => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Manipula clique no botão CTA
   */
  const handleButtonClick = useCallback(() => {
    scrollToSection(SCROLL_TARGET_ID);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────────

  const title = getTexto('banner', 'title', '');
  const subtitle = getTexto('banner', 'subtitle', '');
  const buttonText = getTexto('banner', 'buttonText', 'Saiba mais');

  return (
    <section
      className={styles['secao-banner']}
      id={BANNER_SECTION_ID}
      aria-label="Banner principal"
    >
      {/* Fundo decorativo */}
      <BannerBackground />

      {/* Conteúdo principal do banner */}
      <div className="container text-center">
        {/* Título */}
        <BannerTitle title={title} />

        {/* Subtítulo */}
        <BannerSubtitle subtitle={subtitle} />

        {/* Botão CTA */}
        <BannerButton text={buttonText} targetId={SCROLL_TARGET_ID} onClick={handleButtonClick} />
      </div>
    </section>
  );
};

export default Banner;
