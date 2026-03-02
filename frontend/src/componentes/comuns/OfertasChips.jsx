/**
 * @fileoverview Componente Ofertaschips - Grid de planos/ofertas com cards
 * @component
 * @description
 * Renderiza uma seção de ofertas de planos com:
 * - Título e slogan
 * - Grid responsivo de cards de planos
 * - Features com ícones dinâmicos
 * - Imagens de parceiros/streamers
 * - Destaque para planos especiais
 * @returns {React.ReactElement} Seção de ofertas de chips/planos
 */

import React from 'react';
import styles from '../../estilos/componentes/comuns/OfertasChips.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWifi,
  faPhone,
  faCommentAlt,
  faUsers,
  faGraduationCap,
  faBriefcase,
  faGamepad,
  faTachometerAlt,
  faInfinity,
  faGlobe,
} from '@fortawesome/free-solid-svg-icons';
import { getImagem, getTexto, getTemaConteudosByCategoria } from '../../servicos/tema';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🔧 EFEITOS
// ═════════════════════════════════════════════════════════════════════════════════════

/** @constant {string} ID da seção para navegação via âncora */
const SECTION_ID = 'ofertas-chips';

/** @constant {Object} Mapeamento de strings para ícones FontAwesome */
const ICON_MAP = {
  faWifi,
  faPhone,
  faCommentAlt,
  faUsers,
  faGraduationCap,
  faBriefcase,
  faGamepad,
  faTachometerAlt,
  faInfinity,
  faGlobe,
};

// ═════════════════════════════════════════════════════════════════════════════════════
// 🛠️  FUNÇÕES AUXILIARES
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Obtém as imagens baseado no contador
 * @param {number} count - Quantidade de imagens a retornar
 * @returns {string[]} Array de URLs das imagens
 */
const getImagesByCount = (count) => {
  const imgs = [
    getImagem('chip', 'img1', ''),
    getImagem('chip', 'img2', ''),
    getImagem('chip', 'img3', ''),
    getImagem('chip', 'img4', ''),
  ];

  if (count === 1) return [imgs[0]];
  if (count === 2) return [imgs[1], imgs[2]];
  if (count === 3) return [imgs[1], imgs[2], imgs[3]];
  return [imgs[3], imgs[0], imgs[1]];
};

/**
 * Converte os planos do tema para formato interno
 * @returns {Object[]} Array de planos formatados
 */
const getPlanos = () => {
  const rawPlanos = getTemaConteudosByCategoria('chips');

  return rawPlanos.map((plano) => {
    const planoData = plano.dados || {};
    return {
      ...planoData,
      nome: plano.titulo || planoData.nome,
      features: (planoData.features || []).map((f) => ({
        ...f,
        icon: ICON_MAP[f.icon],
      })),
      imagens: getImagesByCount(planoData.imagensCount || 1),
    };
  });
};

// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * SectionHeader - Título e slogan da seção
 * @returns {React.ReactElement}
 */
const SectionHeader = () => (
  <>
    <h2 className={styles.title} id="ofertas-chips-title">
      {getTexto('chips', 'titulo', 'Planos Exclusivos Oni Telecom')}
    </h2>
    <p className={styles.slogan}>
      {getTexto(
        'chips',
        'slogan',
        'Conectando seu mundo, superando limites. Oni Telecom: Sua jornada, nossa missão.'
      )}
    </p>
  </>
);

/**
 * FeatureItem - Item de feature individual
 * @param {Object} props - Props do componente
 * @param {Object} props.icon - Ícone FontAwesome
 * @param {string} props.text - Texto da feature
 * @returns {React.ReactElement}
 */
const FeatureItem = ({ icon, text }) => (
  <p>
    <FontAwesomeIcon icon={icon} aria-hidden="true" /> {text}
  </p>
);

/**
 * PlanoImagens - Grid de imagens do plano
 * @param {Object} props - Props do componente
 * @param {string[]} props.imagens - URLs das imagens
 * @param {number} props.planoIndex - Índice do plano (para alt text)
 * @returns {React.ReactElement}
 */
const PlanoImagens = ({ imagens, planoIndex }) => (
  <div className={styles['image-container']}>
    {imagens.map((img, imgIndex) => (
      <div className={styles['streamer-offer']} key={imgIndex}>
        <img src={img} alt={`Oferta Streamer ${planoIndex * 10 + imgIndex + 1}`} loading="lazy" />
      </div>
    ))}
  </div>
);

/**
 * PlanoCard - Card individual de plano
 * @param {Object} props - Props do componente
 * @param {Object} props.plano - Dados do plano
 * @param {number} props.index - Índice do plano
 * @returns {React.ReactElement}
 */
const PlanoCard = ({ plano, index }) => (
  <div className="col">
    <div className={styles.cardschip} role="article">
      {/* Badge de Destaque */}
      {plano.destaque && (
        <div className={styles.destaque} role="status">
          {plano.destaque}
        </div>
      )}

      {/* Conteúdo do Card */}
      <div>
        <h3>{plano.nome}</h3>
        <div className={styles['cardschip-content']}>
          {/* Features */}
          {plano.features.map((feature, fIndex) => (
            <FeatureItem key={fIndex} icon={feature.icon} text={feature.text} />
          ))}

          {/* Preço */}
          <p className={styles.preco}>{plano.preco}</p>
        </div>
      </div>

      {/* Imagens Parceiros */}
      <PlanoImagens imagens={plano.imagens} planoIndex={index} />

      {/* Botão Contratar */}
      <button className={styles['contratar-btn']} aria-label={`Contratar plano ${plano.nome}`}>
        {getTexto('chips', 'botaoContratar', 'Contratar')}
      </button>
    </div>
  </div>
);

/**
 * PlanosGrid - Grid de cards de planos
 * @param {Object} props - Props do componente
 * @param {Object[]} props.planos - Array de planos
 * @returns {React.ReactElement}
 */
const PlanosGrid = ({ planos }) => (
  <div
    className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4"
    role="list"
    aria-label="Lista de planos disponíveis"
  >
    {planos.map((plano, index) => (
      <PlanoCard key={index} plano={plano} index={index} />
    ))}
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════════════
// 📱 COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Componente Ofertaschips - Seção de ofertas de chips/planos
 * @returns {React.ReactElement}
 */
const Ofertaschips = () => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // DATA
  // ─────────────────────────────────────────────────────────────────────────────────

  const planos = getPlanos();

  // ─────────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────────

  return (
    <section
      id={SECTION_ID}
      className={styles['ofertas-container']}
      role="region"
      aria-labelledby="ofertas-chips-title"
    >
      {/* Cabeçalho */}
      <SectionHeader />

      {/* Grid de Planos */}
      <PlanosGrid planos={planos} />
    </section>
  );
};

export default Ofertaschips;
