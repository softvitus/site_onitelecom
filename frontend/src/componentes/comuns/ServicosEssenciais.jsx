/**
 * @fileoverview Componente ServicosEssenciais - Grid de links para serviços essenciais
 * @component
 * @description
 * Renderiza uma seção com cards clicáveis para serviços essenciais:
 * - Título da seção
 * - Grid de cards com ícones e links
 * - Navegação para páginas de serviços
 * @returns {React.ReactElement} Seção de serviços essenciais
 */

import React from 'react';
import styles from '../../estilos/componentes/comuns/ServicosEssenciais.module.css';
import {
  getTexto,
  getImagem,
  getTemaConteudosByCategoria,
  getTemaImagensByCategoria,
} from '../../servicos/tema';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🔧 EFEITOS
// ═════════════════════════════════════════════════════════════════════════════════════

/** @constant {string} ID da seção para navegação via âncora */
const SECTION_ID = 'servicos-essenciais';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🛠️  FUNÇÕES AUXILIARES
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Obtém a URL da imagem do serviço
 * @param {string} imgKey - Chave da imagem no tema
 * @returns {string} URL da imagem
 */
const getServiceImage = (imgKey) => {
  return getImagem('servicosEssenciais', imgKey, '');
};

/**
 * Obtém os cards de serviços do tema
 * @returns {Array<Object>} Lista de cards
 */
const getServiceCards = () => {
  const conteudos = getTemaConteudosByCategoria('servicosEssenciais');
  return conteudos.map((card) => {
    const dados = card.dados || {};
    return {
      id: card.id,
      href: dados.href || '#',
      imgKey: dados.imgKey || card.tipo,
      text: dados.text || '',
    };
  });
};

// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * SectionHeader - Título da seção
 * @returns {React.ReactElement}
 */
const SectionHeader = () => (
  <h2 className={styles['clique']} role="heading" aria-level="2">
    {getTexto('servicosEssenciais', 'title', 'Soluções rápidas ao seu alcance')}
  </h2>
);

/**
 * ServiceIcon - Ícone do serviço
 * @param {Object} props - Props do componente
 * @param {string} props.imgSrc - URL da imagem
 * @param {string} props.altText - Texto alternativo
 * @returns {React.ReactElement}
 */
const ServiceIcon = ({ imgSrc, altText }) => (
  <div className={styles['icon']}>
    <img src={imgSrc} alt={altText} loading="lazy" />
  </div>
);

/**
 * ServiceCard - Card individual de serviço essencial
 * @param {Object} props - Props do componente
 * @param {Object} props.card - Dados do card
 * @param {number} props.index - Índice do card
 * @returns {React.ReactElement}
 */
const ServiceCard = ({ card, index }) => {
  const imageSrc = getServiceImage(card.imgKey);

  return (
    <a
      key={index}
      rel="noopener noreferrer"
      href={card.href}
      className={styles['card-custom']}
      aria-label={`Acessar ${card.text}`}
    >
      {/* Ícone */}
      <ServiceIcon imgSrc={imageSrc} altText={card.text} />

      {/* Texto */}
      <p className={styles['clique-text']}>{card.text}</p>
    </a>
  );
};

/**
 * ServicesGrid - Grid de cards de serviços
 * @param {Object} props - Props do componente
 * @param {Array<Object>} props.cards - Lista de cards
 * @returns {React.ReactElement}
 */
const ServicesGrid = ({ cards }) => (
  <div className={styles['cards']} role="navigation" aria-label="Serviços essenciais">
    {cards.map((card, index) => (
      <ServiceCard key={card.id || index} card={card} index={index} />
    ))}
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════════════
// 📱 COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Componente ServicosEssenciais - Seção de links para serviços essenciais
 * @returns {React.ReactElement}
 */
const ServicosEssenciais = () => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // DATA
  // ─────────────────────────────────────────────────────────────────────────────────

  const cards = getServiceCards();

  // ─────────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────────

  return (
    <div
      id={SECTION_ID}
      className={styles['container-custom']}
      role="region"
      aria-labelledby="servicos-essenciais-title"
    >
      {/* Título da seção */}
      <SectionHeader />

      {/* Grid de serviços */}
      <ServicesGrid cards={cards} />
    </div>
  );
};

export default ServicosEssenciais;
