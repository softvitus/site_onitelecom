/**
 * @fileoverview Componente HelpSection - Seção de ajuda e suporte
 * @component
 * @description
 * Renderiza uma seção de ajuda com:
 * - Título e subtítulo com destaques
 * - Descrição da seção
 * - Cards de ajuda (FAQ, Atendimento, Planos)
 * - Links para páginas e WhatsApp
 * - Elementos condicionais via API (isElementoHabilitado)
 * @returns {React.ReactElement} Seção de ajuda completa
 */

import React from 'react';
import styles from '../../estilos/componentes/comuns/HelpSection.module.css';
import {
  getTemaElementosByComponente,
  getTexto,
  getImagem,
  getTemaConteudosByCategoria,
  getLink,
} from '../../servicos/tema';

/**
 * Verifica se um elemento está habilitado no componente
 * @param {string} caminhoPagina - Caminho da página
 * @param {string} nomeComponente - Nome do componente
 * @param {string} nomeElemento - Nome do elemento
 * @returns {boolean}
 */
const isElementoHabilitado = (caminhoPagina, nomeComponente, nomeElemento) => {
  const elementos = getTemaElementosByComponente(caminhoPagina, nomeComponente);
  return elementos.some((e) => e.nome === nomeElemento);
};

// ═════════════════════════════════════════════════════════════════════════════════════
// 🔧 EFEITOS
// ═════════════════════════════════════════════════════════════════════════════════════

/** @constant {string} ID da seção para navegação via âncora */
const SECTION_ID = 'help-section';

/**
 * Mapeamento de IDs dos cards para nomes de imagens da API
 * @constant {Object}
 */
const CARD_IMAGE_MAP = {
  faq: 'faq',
  atendimento: 'atendimento',
  planos: 'planos',
};

// ═════════════════════════════════════════════════════════════════════════════════════
// 🛠️  FUNÇÕES AUXILIARES
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Obtém a URL da imagem do card baseado no ID
 * @param {string} cardId - ID do card
 * @returns {string} URL da imagem
 */
const getCardImage = (cardId) => {
  const imageKey = CARD_IMAGE_MAP[cardId];
  return getImagem('help', imageKey);
};

/**
 * Obtém o link do card, substituindo 'whatsapp' pela URL real da API
 * @param {Object} card - Dados do card
 * @returns {string} URL do link
 */
const getCardLink = (card) => {
  if (!card.link) return '#';
  if (card.link === 'whatsapp') {
    return getLink('social', 'WhatsApp');
  }
  return card.link;
};

/**
 * Determina o target do link baseado no tipo
 * @param {string} link - Link do card
 * @returns {string} '_blank' ou '_self'
 */
const getLinkTarget = (link) => {
  if (!link) return '_self';
  return link.startsWith('http') || link === 'whatsapp' ? '_blank' : '_self';
};

/**
 * Obtém os cards de ajuda da API
 * @returns {Array<Object>} Lista de cards com dados extraídos
 */
const getHelpCards = () => {
  const conteudos = getTemaConteudosByCategoria('ajuda');

  const filtered = (conteudos || []).filter((c) => c.tipo === 'helpSection');

  return filtered.map((c) => {
    // Se valor é string, fazer parse
    const cardData = c.valor || c.dados; // Suporta ambos valor e dados para compatibilidade
    
    if (typeof cardData === 'string') {
      try {
        return JSON.parse(cardData);
      } catch (e) {
        return cardData;
      }
    }
    return cardData || c;
  });
};

// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * SectionTitle - Título e subtítulo com destaques
 * @param {Object} props - Props do componente
 * @param {string} props.caminhoPagina - Caminho da página atual
 * @returns {React.ReactElement|null}
 */
const SectionTitle = ({ caminhoPagina }) => {
  if (!isElementoHabilitado(caminhoPagina, 'helpSection', 'title')) return null;

  return (
    <h1 className={`text-white ${styles['custom-text']}`}>
      {getTexto('helpSection', 'titulo')}{' '}
      <span className={styles['accent-text']}>{getTexto('helpSection', 'tituloDestaque')}</span>
      {' '}{getTexto('helpSection', 'subtitulo')}{' '}
      <span className={styles['accent-text']}>
        {getTexto('helpSection', 'subtituloDestaque')}
      </span>
    </h1>
  );
};

/**
 * SectionDescription - Descrição da seção
 * @param {Object} props - Props do componente
 * @param {string} props.caminhoPagina - Caminho da página atual
 * @returns {React.ReactElement|null}
 */
const SectionDescription = ({ caminhoPagina }) => {
  if (!isElementoHabilitado(caminhoPagina, 'helpSection', 'description')) return null;

  return (
    <p className={styles['description-text']}>{getTexto('helpSection', 'descricao')}</p>
  );
};

/**
 * HelpCardIcon - Ícone/imagem do card
 * @param {Object} props - Props do componente
 * @param {string} props.src - URL da imagem
 * @param {string} props.alt - Texto alternativo
 * @returns {React.ReactElement}
 */
const HelpCardIcon = ({ src, alt }) => (
  <div className={styles['custom-icon']}>
    <img src={src} alt={alt} className="img-fluid" loading="lazy" />
  </div>
);

/**
 * HelpCard - Card individual de ajuda
 * @param {Object} props - Props do componente
 * @param {Object} props.card - Dados do card
 * @returns {React.ReactElement}
 */
const HelpCard = ({ card }) => {
  const cardImage = getCardImage(card.id);
  const cardLink = getCardLink(card);
  const linkTarget = getLinkTarget(card.link);

  return (
    <div className={styles['card-col']}>
      <a
        href={cardLink}
        target={linkTarget}
        rel="noopener noreferrer"
        className={`${styles['custom-card']} h-100`}
        role="article"
        aria-labelledby={`help-card-${card.id}`}
        style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          display: 'block',
          visibility: 'visible',
          opacity: 1,
          textDecoration: 'none',
          cursor: 'pointer',
        }}
      >
        <div className="card-body text-center p-3">
          {/* Ícone */}
          <HelpCardIcon src={cardImage} alt={card.title} />

          {/* Título */}
          <h3 id={`help-card-${card.id}`} className="fw-bold mb-2" style={{ color: '#1a1a2e', fontSize: '1.1em' }}>
            {card.title}
          </h3>

          {/* Descrição */}
          <p className="mb-2" style={{ color: '#4a4a4a', fontSize: '0.9em' }}>
            {card.description}
          </p>

          {/* Botão */}
          <span
            className="btn btn-primary btn-sm mt-2"
            aria-label={`${card.buttonText} - ${card.title}`}
          >
            {card.buttonText}
          </span>
        </div>
      </a>
    </div>
  );
};

/**
 * HelpCardsGrid - Grid de cards de ajuda
 * @param {Object} props - Props do componente
 * @param {string} props.caminhoPagina - Caminho da página atual
 * @returns {React.ReactElement|null}
 */
const HelpCardsGrid = ({ caminhoPagina }) => {
  if (!isElementoHabilitado(caminhoPagina, 'helpSection', 'buttons')) return null;

  const cards = getHelpCards();

  return (
    <div className={styles['cards-row']} aria-label="Opções de ajuda">
      {cards.map((card, index) => (
        <HelpCard key={card.id || index} card={card} />
      ))}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════════════
// 📱 COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Componente HelpSection - Seção de ajuda e suporte
 * @param {Object} props - Props do componente
 * @param {string} props.caminhoPagina - Caminho da página (recebido do DynamicPageRenderer)
 * @returns {React.ReactElement}
 */
const HelpSection = ({ caminhoPagina = '/inicio' }) => {
  return (
    <section
      id={SECTION_ID}
      className={styles['custom-section']}
      aria-labelledby="help-section-title"
    >
      <div className={`container ${styles['content-wrapper']}`}>
        {/* Título centralizado */}
        <div className={styles['title-wrapper']}>
          <SectionTitle caminhoPagina={caminhoPagina} />
        </div>

        {/* Cards de ajuda */}
        <HelpCardsGrid caminhoPagina={caminhoPagina} />

        {/* Descrição abaixo dos cards */}
        <div className={styles['description-wrapper']}>
          <SectionDescription caminhoPagina={caminhoPagina} />
        </div>
      </div>
    </section>
  );
};

export default HelpSection;

