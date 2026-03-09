/**
 * @fileoverview Componente Carousel - Carrossel de imagens responsivo
 * @component
 * @description
 * Renderiza um carrossel de imagens com:
 * - Suporte a versões desktop e mobile
 * - Transição automática temporizada
 * - Barra de progresso visual
 * - Controles de navegação (prev/next)
 * - Indicadores clicáveis
 * @param {Object} props - Props do componente
 * @param {string[]} props.images - URLs das imagens desktop
 * @param {string[]} props.mobileImages - URLs das imagens mobile
 * @param {number} [props.interval=5000] - Intervalo de transição em ms
 * @returns {React.ReactElement} Carrossel responsivo
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import styles from '../../estilos/componentes/comuns/Carrossel.module.css';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🔧 EFEITOS
// ═════════════════════════════════════════════════════════════════════════════════════

/** @constant {number} Intervalo padrão do carrossel em ms */
const DEFAULT_INTERVAL = 5000;

/** @constant {number} Taxa de atualização da barra de progresso em ms */
const PROGRESS_UPDATE_RATE = 10;

// ═════════════════════════════════════════════════════════════════════════════════════
// 🛠️  FUNÇÕES AUXILIARES
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Calcula o incremento de progresso por tick
 * @param {number} interval - Intervalo total
 * @returns {number} Incremento percentual
 */
const calculateProgressIncrement = (interval) => (100 / interval) * PROGRESS_UPDATE_RATE;

/**
 * Navega para o slide anterior
 * @param {number} currentIndex - Índice atual
 * @param {number} totalSlides - Total de slides
 * @returns {number} Novo índice
 */
const getPrevIndex = (currentIndex, totalSlides) => (currentIndex - 1 + totalSlides) % totalSlides;

/**
 * Navega para o próximo slide
 * @param {number} currentIndex - Índice atual
 * @param {number} totalSlides - Total de slides
 * @returns {number} Novo índice
 */
const getNextIndex = (currentIndex, totalSlides) => (currentIndex + 1) % totalSlides;

// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * CarouselSlide - Slide individual do carrossel
 * @param {Object} props - Props do componente
 * @param {string} props.src - URL da imagem
 * @param {number} props.index - Índice do slide
 * @param {boolean} props.isActive - Se é o slide ativo
 * @returns {React.ReactElement}
 */
const CarouselSlide = ({ src, index, isActive }) => (
  <div
    className={`carousel-item ${isActive ? 'active' : ''}`}
    role="tabpanel"
    aria-hidden={!isActive}
  >
    <img
      src={src}
      alt={`Slide ${index + 1}`}
      className={`d-block w-100 ${styles['carousel-item']}`}
      loading={index === 0 ? 'eager' : 'lazy'}
    />
  </div>
);

/**
 * NavigationButton - Botão de navegação do carrossel
 * @param {Object} props - Props do componente
 * @param {string} props.direction - Direção ('prev' | 'next')
 * @param {Function} props.onClick - Handler de clique
 * @returns {React.ReactElement}
 */
const NavigationButton = ({ direction, onClick }) => {
  const isPrev = direction === 'prev';
  const label = isPrev ? 'Anterior' : 'Próximo';

  return (
    <button
      className={`carousel-control-${direction} ${styles[`carousel-control-${direction}`]}`}
      type="button"
      onClick={onClick}
      aria-label={label}
    >
      <span
        className={`carousel-control-${direction}-icon ${styles[`carousel-control-${direction}-icon`]}`}
        aria-hidden="true"
      />
      <span className="visually-hidden">{label}</span>
    </button>
  );
};

/**
 * ProgressIndicator - Indicador de progresso individual
 * @param {Object} props - Props do componente
 * @param {number} props.index - Índice do indicador
 * @param {boolean} props.isActive - Se é o indicador ativo
 * @param {number} props.progress - Progresso atual (0-100)
 * @param {Function} props.onClick - Handler de clique
 * @returns {React.ReactElement}
 */
const ProgressIndicator = ({ index, isActive, progress, onClick }) => (
  <button
    type="button"
    className={`${styles['progress-indicator']} ${isActive ? 'active' : ''}`}
    onClick={() => onClick(index)}
    aria-label={`Slide ${index + 1}`}
    aria-selected={isActive}
    role="tab"
  >
    <div className={styles.progress} style={{ width: isActive ? `${progress}%` : '0%' }} />
  </button>
);

/**
 * ProgressIndicators - Container de indicadores de progresso
 * @param {Object} props - Props do componente
 * @param {number} props.total - Total de slides
 * @param {number} props.currentIndex - Índice atual
 * @param {number} props.progress - Progresso atual
 * @param {Function} props.onIndicatorClick - Handler de clique
 * @returns {React.ReactElement}
 */
const ProgressIndicators = ({ total, currentIndex, progress, onIndicatorClick }) => (
  <div
    className={styles['progress-indicators']}
    role="tablist"
    aria-label="Indicadores do carrossel"
  >
    {Array.from({ length: total }).map((_, index) => (
      <ProgressIndicator
        key={index}
        index={index}
        isActive={index === currentIndex}
        progress={progress}
        onClick={onIndicatorClick}
      />
    ))}
  </div>
);

/**
 * CarouselContainer - Container do carrossel (desktop ou mobile)
 * @param {Object} props - Props do componente
 * @param {string[]} props.images - URLs das imagens
 * @param {string} props.id - ID do carrossel
 * @param {string} props.variant - Variante CSS ('desktop' | 'mobile')
 * @param {number} props.currentIndex - Índice atual
 * @param {number} props.progress - Progresso atual
 * @param {Function} props.onPrev - Handler para slide anterior
 * @param {Function} props.onNext - Handler para próximo slide
 * @param {Function} props.onIndicatorClick - Handler para clique em indicador
 * @returns {React.ReactElement}
 */
const CarouselContainer = ({
  images,
  id,
  variant,
  currentIndex,
  progress,
  onPrev,
  onNext,
  onIndicatorClick,
}) => (
  <div
    id={id}
    className={`${styles['carousel-container']} ${styles[variant]}`}
    aria-roledescription="carrossel"
    aria-label={`Carrossel ${variant}`}
  >
    {/* Slides */}
    <div className="carousel-inner">
      {images.map((img, index) => (
        <CarouselSlide key={index} src={img} index={index} isActive={index === currentIndex} />
      ))}
    </div>

    {/* Controles de Navegação */}
    <NavigationButton direction="prev" onClick={onPrev} />
    <NavigationButton direction="next" onClick={onNext} />

    {/* Indicadores de Progresso */}
    <ProgressIndicators
      total={images.length}
      currentIndex={currentIndex}
      progress={progress}
      onIndicatorClick={onIndicatorClick}
    />
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════════════
// 📱 COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Componente Carousel - Carrossel de imagens responsivo
 * @param {Object} props - Props do componente
 * @param {string[]} props.images - Imagens desktop
 * @param {string[]} props.mobileImages - Imagens mobile
 * @param {number} [props.interval=5000] - Intervalo de transição
 * @returns {React.ReactElement}
 */
const Carousel = ({ images, mobileImages, interval = DEFAULT_INTERVAL }) => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────────────

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // ─────────────────────────────────────────────────────────────────────────────────
  // REFS
  // ─────────────────────────────────────────────────────────────────────────────────

  const progressTimer = useRef(null);
  const slideTimer = useRef(null);

  // ─────────────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Inicia os timers de progresso e transição
   */
  const startTimers = useCallback(() => {
    clearInterval(progressTimer.current);
    clearTimeout(slideTimer.current);

    setProgress(0);

    // Timer de progresso visual
    progressTimer.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + calculateProgressIncrement(interval);
      });
    }, PROGRESS_UPDATE_RATE);

    // Timer de transição automática
    slideTimer.current = setTimeout(() => {
      setCurrentIndex((prevIndex) => getNextIndex(prevIndex, images.length));
    }, interval);
  }, [interval, images.length]);

  /**
   * Navega para slide anterior
   */
  const handlePrevClick = useCallback(() => {
    setCurrentIndex((prevIndex) => getPrevIndex(prevIndex, images.length));
  }, [images.length]);

  /**
   * Navega para próximo slide
   */
  const handleNextClick = useCallback(() => {
    setCurrentIndex((prevIndex) => getNextIndex(prevIndex, images.length));
  }, [images.length]);

  /**
   * Navega para slide específico via indicador
   * @param {number} index - Índice do slide
   */
  const handleIndicatorClick = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    startTimers();

    return () => {
      clearInterval(progressTimer.current);
      clearTimeout(slideTimer.current);
    };
  }, [currentIndex, startTimers]);

  // ─────────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Carrossel Desktop */}
      <CarouselContainer
        images={images}
        id="carouselDesktop"
        variant="desktop"
        currentIndex={currentIndex}
        progress={progress}
        onPrev={handlePrevClick}
        onNext={handleNextClick}
        onIndicatorClick={handleIndicatorClick}
      />

      {/* Carrossel Mobile */}
      <CarouselContainer
        images={mobileImages}
        id="carouselMobile"
        variant="mobile"
        currentIndex={currentIndex}
        progress={progress}
        onPrev={handlePrevClick}
        onNext={handleNextClick}
        onIndicatorClick={handleIndicatorClick}
      />
    </>
  );
};

export default Carousel;
