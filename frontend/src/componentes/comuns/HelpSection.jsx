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
    // Se dados é string, fazer parse
    if (typeof c.dados === 'string') {
      try {
        return JSON.parse(c.dados);
      } catch (e) {
        return c.dados;
      }
    }
    return c.dados || c;
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
    <div className="row align-items-center mb-5">
      <div className="col-lg-6 mb-4 mb-lg-0">
        <h1 className={`text-white ${styles['custom-text']}`}>
          {getTexto('helpSection', 'titulo')}{' '}
          <span className={styles['accent-text']}>{getTexto('helpSection', 'tituloDestaque')}</span>
          <br />
          {getTexto('helpSection', 'subtitulo')}{' '}
          <span className={styles['accent-text']}>
            {getTexto('helpSection', 'subtituloDestaque')}
          </span>
        </h1>
      </div>
    </div>
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
    <div className="row align-items-center mb-5">
      <div className="col-lg-6 mb-4 mb-lg-0">
        <p className="text-white lead mt-4 fs-4">{getTexto('helpSection', 'descricao')}</p>
      </div>
    </div>
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
    <div className="col-md-4">
      <div
        className={`${styles['custom-card']} h-100`}
        role="article"
        aria-labelledby={`help-card-${card.id}`}
        style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          display: 'block',
          visibility: 'visible',
          opacity: 1,
        }}
      >
        <div className="card-body text-center p-4">
          {/* Ícone */}
          <HelpCardIcon src={cardImage} alt={card.title} />

          {/* Título */}
          <h3 id={`help-card-${card.id}`} className="fw-bold mb-3" style={{ color: '#1a1a2e' }}>
            {card.title}
          </h3>

          {/* Descrição */}
          <p className="fs-6" style={{ color: '#4a4a4a' }}>
            {card.description}
          </p>

          {/* Botão */}
          <a
            href={cardLink}
            className="btn btn-primary mt-3"
            target={linkTarget}
            rel="noopener noreferrer"
            aria-label={`${card.buttonText} - ${card.title}`}
          >
            {card.buttonText}
          </a>
        </div>
      </div>
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
    <div className="row g-4 mt-4" aria-label="Opções de ajuda">
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
      <div className={`container ${styles['content-wrapper']} py-5`}>
        {/* Título e subtítulo */}
        <SectionTitle caminhoPagina={caminhoPagina} />

        {/* Descrição */}
        <SectionDescription caminhoPagina={caminhoPagina} />

        {/* Cards de ajuda */}
        <HelpCardsGrid caminhoPagina={caminhoPagina} />
      </div>
    </section>
  );
};

export default HelpSection;

