/**
 * @fileoverview Componente TelefoniaBanner - Banner promocional de telefonia
 * @component
 * @description
 * Renderiza um banner hero com:
 * - Imagem de fundo promocional
 * - Cards de ação (recarga e informações)
 * - Links para recarga externa e página de telefonia
 * - Ícones ilustrativos
 * @returns {React.ReactElement} Banner de telefonia com cards de ação
 */

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMobileAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import styles from '../../estilos/componentes/comuns/TelefoniaBanner.module.css';
import { getImagem, getLink, getTemaTextosByCategoria } from '../../servicos/tema';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🔧 EFEITOS
// ═════════════════════════════════════════════════════════════════════════════════════

/** @constant {string} ID da seção para navegação via âncora */
const SECTION_ID = 'Telefonia';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🛠️  FUNÇÕES AUXILIARES
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Obtém os textos do banner do tema
 * @returns {Object} Textos do banner (card1, card2)
 */
const getBannerTexts = () => {
  const textos = getTemaTextosByCategoria('telefoniaBanner');
  const textMap = {};
  textos.forEach((t) => {
    textMap[t.chave] = t.valor;
  });

  return {
    card1: {
      titulo: textMap.card1_titulo || 'Recarga Rápida e Fácil',
      descricao: textMap.card1_descricao || '',
      botao: textMap.card1_botao || 'Recarregar Agora',
    },
    card2: {
      titulo: textMap.card2_titulo || 'Novo na nossa empresa?',
      descricao: textMap.card2_descricao || '',
      botao: textMap.card2_botao || 'Conheça Nossos Planos',
    },
  };
};

/**
 * Obtém a imagem do banner
 * @returns {string} URL da imagem
 */
const getBannerImage = () => getImagem('telefoniaBanner', 'banner', '');

/**
 * Obtém os links de ação
 * @returns {Object} {recarga, telefonia}
 */
const getActionLinks = () => ({
  recarga: getLink('externa', 'Recarga', '#'),
  telefonia: getLink('rota', 'Planos', '/Planos'),
});

// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * BannerImage - Imagem de fundo do banner
 * @param {Object} props - Props do componente
 * @param {string} props.src - URL da imagem
 * @returns {React.ReactElement}
 */
const BannerImage = ({ src }) => (
  <img src={src} alt="Banner Oni Telecom" className={styles['banner-image']} loading="lazy" />
);

/**
 * ActionCard - Card de ação individual
 * @param {Object} props - Props do componente
 * @param {string} props.titulo - Título do card
 * @param {string} props.descricao - Descrição do card
 * @param {string} props.botaoTexto - Texto do botão
 * @param {string} props.href - Link do botão
 * @param {Object} props.icon - Ícone FontAwesome
 * @param {string} props.variant - Variante do botão ('primary' | 'secondary')
 * @param {boolean} [props.external] - Se é link externo
 * @returns {React.ReactElement}
 */
const ActionCard = ({ titulo, descricao, botaoTexto, href, icon, variant, external = false }) => {
  const buttonClasses = `${styles['btn-custom']} ${styles[`btn-${variant}`]}`;
  const externalProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  return (
    <div className={styles['card-custom']} role="article">
      <h3 className={styles['card-title']}>{titulo}</h3>
      <p className={styles['card-text']}>{descricao}</p>
      <a href={href} className={buttonClasses} {...externalProps}>
        <FontAwesomeIcon icon={icon} className={styles['icon']} aria-hidden="true" />
        {botaoTexto}
      </a>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════════════
// 📱 COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Componente TelefoniaBanner - Banner promocional de telefonia
 * @returns {React.ReactElement}
 */
const TelefoniaBanner = () => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // DATA
  // ─────────────────────────────────────────────────────────────────────────────────

  const texts = getBannerTexts();
  const image = getBannerImage();
  const links = getActionLinks();

  // ─────────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────────

  return (
    <div
      id={SECTION_ID}
      className={styles['banner-container']}
     
      aria-labelledby="telefonia-title"
    >
      {/* Imagem de Fundo */}
      <BannerImage src={image} />

      {/* Cards de Ação */}
      <div className={styles['overlay-content']}>
        {/* Card Recarga */}
        <ActionCard
          titulo={texts.card1?.titulo}
          descricao={texts.card1?.descricao}
          botaoTexto={texts.card1?.botao}
          href={links.recarga}
          icon={faMobileAlt}
          variant="primary"
          external
        />

        {/* Card Informações */}
        <ActionCard
          titulo={texts.card2?.titulo}
          descricao={texts.card2?.descricao}
          botaoTexto={texts.card2?.botao}
          href={links.telefonia}
          icon={faInfoCircle}
          variant="secondary"
        />
      </div>
    </div>
  );
};

export default TelefoniaBanner;

