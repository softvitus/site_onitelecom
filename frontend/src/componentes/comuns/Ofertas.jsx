/**
 * @fileoverview Componente Ofertas - Exibe um carrossel de planos/ofertas de internet
 * com navegação, expansão de conteúdo e visualização de benefícios
 * @component
 * @description
 * Renderiza um carrossel responsivo de ofertas com:
 * - Navegação anterior/próximo com chevrons
 * - Toggle para abrir/fechar todos os cards
 * - Expansão individual de benefícios com toggle
 * - Preços formatados em reais
 * - Ajuste automático para desktop (4 cards) e mobile (1 card)
 * @returns {React.ReactElement} Container do carrossel de ofertas
 */

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import styles from '../../estilos/componentes/comuns/Ofertas.module.css';
import { getTemaConteudosByCategoria, getImagem, getTexto } from '../../servicos/tema';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🔧 EFEITOS
// ═════════════════════════════════════════════════════════════════════════════════════

/** @constant {number} Número de cards visíveis em desktop */
const CARDS_VISIBLE_DESKTOP = 4;

/** @constant {number} Número de cards visíveis em mobile */
const CARDS_VISIBLE_MOBILE = 1;

/** @constant {number} Breakpoint para mudar de layout */
const MOBILE_BREAKPOINT = 768;

// ═════════════════════════════════════════════════════════════════════════════════════
// 🛠️  FUNÇÕES AUXILIARES
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Determina quantos cards devem ser visíveis baseado na largura da tela
 * @param {number} windowWidth - Largura da janela em pixels
 * @returns {number} Número de cards visíveis (1 ou 4)
 */
const calculateVisibleCards = (windowWidth) => {
  return windowWidth <= MOBILE_BREAKPOINT ? CARDS_VISIBLE_MOBILE : CARDS_VISIBLE_DESKTOP;
};

/**
 * Calcula o índice máximo permitido do carrossel
 * @param {Array} cards - Array de cards disponíveis
 * @param {number} visibleCards - Número de cards visíveis
 * @returns {number} Índice máximo permitido
 */
const calculateMaxIndex = (cards, visibleCards) => {
  return Math.max(0, cards.length - visibleCards);
};

/**
 * Cria um objeto com todos os cards abertos ou fechados
 * @param {Array} cards - Array de cards
 * @param {boolean} isOpen - Estado desejado (aberto ou fechado)
 * @returns {Object} Mapa de IDs com estado de abertura
 */
const createCardStateMap = (cards, isOpen) => {
  const map = {};
  cards.forEach((card) => {
    map[card.id] = isOpen;
  });
  return map;
};

// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * OfertasHeader - Cabeçalho com título e descrição
 * @param {Object} props - Props do componente
 * @returns {React.ReactElement}
 */
const OfertasHeader = () => (
  <div className={styles['offer-headline-container']}>
    <div className={styles['offer-headline']}>
      <h2>{getTexto('ofertas', 'titulo', 'Turbine sua conexão')}</h2>
      <p>
        {getTexto(
          'ofertas',
          'descricao',
          'Planos de internet ultrarrápida com benefícios exclusivos para sua empresa!'
        )}
      </p>
    </div>
  </div>
);

/**
 * OniFoLogo - Logo ONI Fibra que aparece em todos os cards
 * @returns {React.ReactElement}
 */
const OniFoLogo = () => {
  const onifoImg = getImagem('oferta', 'onifo', '');
  return onifoImg ? (
    <div className={styles['onifo-container']}>
      <img src={onifoImg} alt="ONI Fibra" className={styles['onifo-logo']} loading="lazy" />
    </div>
  ) : null;
};

/**
 * BenefitsCompact - Benefícios exibidos de forma compacta
 * @param {Object} props - Props do componente
 * @param {Array} props.benefits - Array de benefícios
 * @returns {React.ReactElement}
 */
const BenefitsCompact = ({ benefits }) => {
  if (!benefits || benefits.length === 0) return null;
  
  return (
    <div className={styles['benefits-compact']}>
      {benefits.map((benefit, idx) => (
        <div key={idx} className={styles['benefit-icon']}>
          {benefit.type === 'sideBySide' ? (
            benefit.images.map((image, imageIdx) => (
              <img key={imageIdx} src={image.img} alt={image.alt} loading="lazy" />
            ))
          ) : (
            <img src={benefit.img} alt={benefit.alt} loading="lazy" />
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * PriceDisplay - Exibe o preço formatado em reais
 * @param {Object} props - Props do componente
 * @param {number} props.price - Preço em reais
 * @returns {React.ReactElement}
 */
const PriceDisplay = ({ price }) => {
  const integerPart = Math.floor(price);
  const decimalPart = (price % 1).toFixed(2).slice(2);

  return (
    <div className={styles.price}>
      <span className={styles.currency}>{getTexto('ofertas', 'moeda', 'R$')}</span>
      <span className={styles.integer}>{integerPart}</span>
      <div>
        <span className={styles.decimal}>,{decimalPart}</span>
        <span className={styles.month}>{getTexto('ofertas', 'periodo', '/mês')}</span>
      </div>
    </div>
  );
};

/**
 * OfertaCard - Card individual de oferta sempre aberto e padronizado
 * @param {Object} props - Props do componente
 * @param {Object} props.card - Dados do card
 * @param {number} props.index - Índice do card
 * @param {boolean} props.isVisible - Card está visível no carrossel
 * @returns {React.ReactElement}
 */
const OfertaCard = ({ card, index, isVisible }) => (
  <div
    className={`${styles['card-oferta']} ${isVisible ? styles.visible : styles.hidden}`}
    id={`card-oferta-${card.id}`}
  >
    {card.seal && <img src={card.seal} alt="Selo" className={styles.selo} loading="lazy" />}

    <div className={styles.header}>{card.header}</div>

    <div className={styles['card-content']}>
      {/* Logo ONI Fibra */}
      <OniFoLogo />

      {/* Seção de velocidade */}
      <div className={styles['speed-section']}>
        <div className={styles.speed}>{card.speed}</div>
        <div className={styles['speed-subtext']}>
          {getTexto('ofertas', 'velocidade_unidade', 'MEGA')}
        </div>
      </div>

      {/* Benefícios compactos (outros parceiros) */}
      {card.benefits && card.benefits.length > 0 && (
        <>
          <div className={styles['benefits-label']}>
            {getTexto('ofertas', 'beneficios_label', 'BENEFÍCIOS INCLUSOS:')}
          </div>
          <BenefitsCompact benefits={card.benefits} />
        </>
      )}

      {/* Divisor */}
      <div className={styles.divider}></div>

      {/* Apps de Streaming */}
      {card.appChoices && card.appChoices.length > 0 && (
        <>
          <div className={styles['app-choices']}>
            {getTexto('ofertas', 'app_escolha', '+ 1 APP DE SUA ESCOLHA:')}
          </div>
          <div className={styles['app-icons']}>
            {card.appChoices.map((app, idx) => (
              <img key={idx} src={app.img} alt={app.alt} loading="lazy" />
            ))}
          </div>
        </>
      )}

      {/* Divisor */}
      <div className={styles.divider}></div>

      {/* Texto de preço */}
      <div className={styles['price-text']}>
        {getTexto('ofertas', 'preco_label', 'Tudo isso por')}
      </div>

      {/* Preço */}
      <PriceDisplay price={card.price} />

      {/* Botão de contratação */}
      <button className={styles['btn-contratar']} aria-label={`Contratar plano ${card.header}`}>
        {getTexto('ofertas', 'botao_contratar', 'CONTRATE AGORA')}
      </button>
    </div>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════════════
// 📱 COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Componente Ofertas - Carrossel de planos/ofertas
 * @returns {React.ReactElement}
 */
const Ofertas = () => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────────────

  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(CARDS_VISIBLE_DESKTOP);

  // Obtém cards de ofertas da API via tema
  const ofertasConteudos = getTemaConteudosByCategoria('planos').filter((c) => c.tipo === 'oferta');

  // Função para resolver imagens nos benefits
  const resolveImagensNoBenefit = (benefit) => {
    if (benefit.type === 'sideBySide') {
      return {
        ...benefit,
        images: benefit.images.map((img) => ({
          ...img,
          img: getImagem('oferta', img.imgKey, img.img),
        })),
      };
    }
    return {
      ...benefit,
      img: getImagem('oferta', benefit.imgKey, benefit.img),
    };
  };

  const cards = ofertasConteudos.map((c) => {
    const dados = c.dados || {};
    const benefits = (dados.benefits || []).map(resolveImagensNoBenefit);
    const appChoices = (dados.appChoices || []).map((app) => ({
      ...app,
      img: getImagem('oferta', app.imgKey, app.img),
    }));

    return {
      id: c.id,
      header: dados.header || c.titulo || '',
      speed: dados.speed || 0,
      price: dados.price || 0,
      seal: dados.sealImgKey ? getImagem('oferta', dados.sealImgKey, '') : null,
      cardType: dados.cardType || 'default',
      benefits,
      appChoices,
      featured: dados.featured || false,
      popular: dados.popular || false,
    };
  });

  // ─────────────────────────────────────────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Ajusta a quantidade de cards visíveis conforme o redimensionamento da tela
   */
  useEffect(() => {
    const handleResize = () => {
      const newVisibleCards = calculateVisibleCards(window.innerWidth);
      setVisibleCards(newVisibleCards);

      // Garante que o índice atual não ultrapasse o máximo permitido
      const maxIndex = calculateMaxIndex(cards, newVisibleCards);
      setCurrentIndex((prev) => Math.min(prev, maxIndex));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [cards]);

  // ─────────────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Avança para o próximo card no carrossel
   */
  const handleNavigateNext = () => {
    const maxIndex = calculateMaxIndex(cards, visibleCards);
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  /**
   * Volta para o card anterior no carrossel
   */
  const handleNavigatePrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };



  // ─────────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────────

  const maxIndex = calculateMaxIndex(cards, visibleCards);
  const isPrevDisabled = currentIndex === 0;
  const isNextDisabled = currentIndex === maxIndex;

  return (
    <div className={styles['offer-carousel']}>
      {/* Cabeçalho da seção de ofertas */}
      <OfertasHeader />

      {/* Carrossel de ofertas */}
      <div className={styles['carousel-container']}>
        {/* Botão navegação: anterior */}
        <button
          className={`${styles['nav-button']} ${styles.prev}`}
          onClick={handleNavigatePrevious}
          disabled={isPrevDisabled}
          aria-label="Plano anterior"
          title="Anterior"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        {/* Botão navegação: próximo */}
        <button
          className={`${styles['nav-button']} ${styles.next}`}
          onClick={handleNavigateNext}
          disabled={isNextDisabled}
          aria-label="Próximo plano"
          title="Próximo"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>

        {/* Container de cards com animação de scroll */}
        <div
          className={styles['card-container']}
          style={{ transform: `translateX(-${currentIndex * (100 / visibleCards)}%)` }}
         
          aria-label="Carrossel de ofertas"
        >
          {/* Renderização dos cards */}
          {cards.map((card, index) => {
            const isVisible = index >= currentIndex && index < currentIndex + visibleCards;

            return (
              <OfertaCard
                key={card.id}
                card={card}
                index={index}
                isVisible={isVisible}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Ofertas;

