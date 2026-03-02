/**
 * @fileoverview Componente CardsEntretenimento - Exibe ofertas de entretenimento por categoria
 * @component
 * @description
 * Renderiza uma página de ofertas de entretenimento com:
 * - Navegação por categorias (Streaming/Música, Educação, Segurança, Saúde)
 * - Barra de busca
 * - Cards de ofertas com logo, banner, preço e descrição
 * - Seções separadas por categoria
 * @returns {React.ReactElement} Página de entretenimento completa
 */

import React, { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMusic,
  faBook,
  faShieldAlt,
  faHeartbeat,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import styles from '../../estilos/componentes/comuns/CardsEntretenimento.module.css';
import { getTexto, getImagem, getTemaConteudosByCategoria } from '../../servicos/tema';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🔧 EFEITOS
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Configuração das categorias de entretenimento
 * @constant {Array<Object>}
 */
const CATEGORIES = [
  {
    id: 'streaming-musica',
    key: 'streamingMusica',
    name: getTexto('entretenimento', 'categoria_streamingMusica', 'Streaming/Música'),
    icon: faMusic,
  },
  {
    id: 'educacao',
    key: 'educacao',
    name: getTexto('entretenimento', 'categoria_educacao', 'Educação'),
    icon: faBook,
  },
  {
    id: 'seguranca-digital',
    key: 'segurancaDigital',
    name: getTexto('entretenimento', 'categoria_segurancaDigital', 'Segurança Digital'),
    icon: faShieldAlt,
  },
  {
    id: 'saude-bem-estar',
    key: 'saudeBemEstar',
    name: getTexto('entretenimento', 'categoria_saudeBemEstar', 'Saúde e Bem-estar'),
    icon: faHeartbeat,
  },
];

/**
 * Descrições das seções por categoria
 * @constant {Object}
 */
const SECTION_DESCRIPTIONS = {
  streamingMusica: getTexto(
    'entretenimento',
    'desc_streamingMusica',
    'Descubra o melhor em entretenimento musical e serviços de streaming'
  ),
  educacao: getTexto(
    'entretenimento',
    'desc_educacao',
    'Expanda seus horizontes com cursos e recursos educacionais de alta qualidade'
  ),
  segurancaDigital: getTexto(
    'entretenimento',
    'desc_segurancaDigital',
    'Proteja sua presença online com as melhores soluções de segurança digital'
  ),
  saudeBemEstar: getTexto(
    'entretenimento',
    'desc_saudeBemEstar',
    'Cuide do seu corpo e mente com aplicativos focados em saúde e bem-estar'
  ),
};

// ═════════════════════════════════════════════════════════════════════════════════════
// 🛠️  FUNÇÕES AUXILIARES
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Obtém a imagem do card baseada no ID e tipo
 * @param {string} cardId - ID do card (deezer, duolingo, etc.)
 * @param {string} type - Tipo de imagem ('logo' ou 'banner')
 * @param {string} fallbackLogo - Logo fallback
 * @param {string} fallbackBanner - Banner fallback
 * @returns {string} URL da imagem
 */
const getCardImage = (cardId, type, fallbackLogo, fallbackBanner) => {
  const deezerLogo = getImagem('entretenimento', 'Logo DEEZER', '');
  const deezerBanner = getImagem('entretenimento', 'DEEZER', '');
  if (cardId === 'deezer' && (deezerLogo || deezerBanner)) {
    return type === 'logo' ? deezerLogo : deezerBanner;
  }
  return type === 'logo' ? fallbackLogo : fallbackBanner;
};

/**
 * Obtém todas as ofertas por categoria do tema
 * @returns {Object} Objeto com ofertas por categoria
 */
const getOffersByCategory = () => {
  // API retorna todos em categoria 'entretenimento', mapeamos para estrutura interna
  const allOffers = getTemaConteudosByCategoria('entretenimento') || [];
  const mappedOffers = allOffers.map((item) => ({
    id: item.dados?.id || item.id,
    name: item.dados?.name || item.titulo,
    price: item.dados?.price || '0,00',
    description: item.dados?.description || item.descricao || '',
    logo: '',
    banner: '',
  }));

  // Distribui ofertas por categorias baseado no ID
  return {
    streamingMusica: mappedOffers.filter((o) => ['deezer'].includes(o.id)),
    educacao: mappedOffers.filter((o) => ['duolingo'].includes(o.id)),
    segurancaDigital: mappedOffers.filter((o) => ['nordvpn'].includes(o.id)),
    saudeBemEstar: mappedOffers.filter((o) => ['calm'].includes(o.id)),
  };
};

/**
 * Realiza scroll suave até uma seção
 * @param {string} sectionId - ID da seção
 */
const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * CategoryButton - Botão de navegação por categoria
 * @param {Object} props - Props do componente
 * @param {Object} props.category - Dados da categoria
 * @param {Function} props.onClick - Callback ao clicar
 * @returns {React.ReactElement}
 */
const CategoryButton = ({ category, onClick }) => (
  <button
    className={styles['category-btn']}
    onClick={() => onClick(category.id)}
    aria-label={`Ir para ${category.name}`}
  >
    <FontAwesomeIcon icon={category.icon} className={styles['category-icon']} aria-hidden="true" />
    <span>{category.name}</span>
  </button>
);

/**
 * SearchBar - Barra de busca de ofertas
 * @param {Object} props - Props do componente
 * @param {string} props.searchTerm - Termo de busca atual
 * @param {Function} props.onSearchChange - Callback ao mudar busca
 * @param {Function} props.onSearch - Callback ao executar busca
 * @returns {React.ReactElement}
 */
const SearchBar = ({ searchTerm, onSearchChange, onSearch }) => (
  <div className={styles['search-wrapper']}>
    <div className={styles['search-bar']}>
      <input
        type="text"
        className={styles['form-control']}
        placeholder={getTexto('entretenimento', 'search_placeholder', 'Digite a sua busca aqui')}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        aria-label="Buscar ofertas"
      />
      <button
        className={styles['search-btn']}
        type="button"
        onClick={onSearch}
        aria-label="Executar busca"
      >
        <FontAwesomeIcon icon={faSearch} className={styles['search-icon']} />
        <span>Buscar</span>
      </button>
    </div>
  </div>
);

/**
 * CategoriesNavigation - Navegação por categorias
 * @param {Object} props - Props do componente
 * @param {Function} props.onCategoryClick - Callback ao clicar em categoria
 * @param {string} props.searchTerm - Termo de busca
 * @param {Function} props.onSearchChange - Callback ao mudar busca
 * @param {Function} props.onSearch - Callback ao executar busca
 * @returns {React.ReactElement}
 */
const CategoriesNavigation = ({ onCategoryClick, searchTerm, onSearchChange, onSearch }) => (
  <nav className={styles['navegacao']} role="navigation" aria-label="Navegação por categorias">
    <div className={styles['container']}>
      <div className={styles['categories-wrapper']}>
        {CATEGORIES.map((category) => (
          <CategoryButton key={category.id} category={category} onClick={onCategoryClick} />
        ))}
      </div>
      <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} onSearch={onSearch} />
    </div>
  </nav>
);

/**
 * OfferCard - Card individual de oferta
 * @param {Object} props - Props do componente
 * @param {string} props.logo - URL do logo
 * @param {string} props.name - Nome da oferta
 * @param {string} props.banner - URL do banner
 * @param {string} props.price - Preço da oferta
 * @param {string} props.description - Descrição da oferta
 * @param {string} props.id - ID da oferta
 * @returns {React.ReactElement}
 */
const OfferCard = ({ logo, name, banner, price, description, id }) => {
  const logoImage = getCardImage(id, 'logo', logo, banner);
  const bannerImage = getCardImage(id, 'banner', logo, banner);

  return (
    <div className={styles['card-manual']} role="article" aria-labelledby={`offer-${id}`}>
      {/* Header do card com logo */}
      <div className={styles['d-flex']}>
        <div className={styles['logo-manual']}>
          <img
            alt={`${name} logo`}
            className={styles['logo-img-manual']}
            src={logoImage}
            loading="lazy"
          />
        </div>
        <div className={styles['logo-text-manual']}>
          <span id={`offer-${id}`} className={styles['text-primary']}>
            {name}
          </span>
        </div>
      </div>

      {/* Conteúdo do card */}
      <div className={styles['card-container']}>
        <div className={styles['card-content-manual']}>
          {/* Banner */}
          <img
            alt={`${name} banner`}
            className={styles['card-image-manual']}
            src={bannerImage}
            loading="lazy"
          />

          {/* Preço */}
          <div className={styles['text-center']}>
            <span className={styles['text-secondary']}>R$</span>
            <span className={styles['fs-4']}>{price}</span>
            <span className={styles['text-secondary']}>/mês*</span>
          </div>

          {/* Botões */}
          <div className={styles['text-center']}>
            <button className={styles['btn-primary']} aria-label={`Saiba mais sobre ${name}`}>
              {getTexto('entretenimento', 'button_saibaMais', 'Saiba Mais')}
            </button>
          </div>
          <div className={styles['text-center']}>
            <small>{getTexto('entretenimento', 'button_consultar', '*Consulte condições')}</small>
          </div>
        </div>

        {/* Descrição */}
        <div className={styles['description-container']}>
          <p className={styles['description-text']}>{description}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * OffersGrid - Grid de ofertas de uma categoria
 * @param {Object} props - Props do componente
 * @param {Array<Object>} props.offers - Lista de ofertas
 * @returns {React.ReactElement}
 */
const OffersGrid = ({ offers }) => (
  <div className={styles['container']}>
    <div className={styles['row']}>
      {offers.map((offer, index) => (
        <div key={offer.id || index} className={styles['col-lg-3']}>
          <OfferCard {...offer} />
        </div>
      ))}
    </div>
  </div>
);

/**
 * CategorySection - Seção de uma categoria com ofertas
 * @param {Object} props - Props do componente
 * @param {Object} props.category - Dados da categoria
 * @param {Array<Object>} props.offers - Lista de ofertas
 * @returns {React.ReactElement}
 */
const CategorySection = ({ category, offers }) => (
  <section className={styles[category.id]} role="region" aria-labelledby={category.id}>
    {/* Header da seção */}
    <div className={styles['section-headline']}>
      <div className={styles['container']}>
        <h2 id={category.id}>{category.name}</h2>
        <p>{SECTION_DESCRIPTIONS[category.key]}</p>
      </div>
    </div>

    {/* Grid de ofertas */}
    <OffersGrid offers={offers} />
  </section>
);

// ═════════════════════════════════════════════════════════════════════════════════════
// 📱 COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Componente CardsEntretenimento - Página de ofertas de entretenimento
 * @returns {React.ReactElement}
 */
const CardsEntretenimento = () => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────────────

  const [searchTerm, setSearchTerm] = useState('');

  // ─────────────────────────────────────────────────────────────────────────────────
  // DATA
  // ─────────────────────────────────────────────────────────────────────────────────

  const offers = getOffersByCategory();

  // ─────────────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Navega para uma categoria específica
   */
  const handleCategoryClick = useCallback((categoryId) => {
    scrollToSection(categoryId);
  }, []);

  /**
   * Atualiza o termo de busca
   */
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  /**
   * Executa a busca (implementação futura)
   */
  const handleSearch = useCallback(() => {
    // TODO: Implementar busca nas ofertas
    console.log('Buscando por:', searchTerm);
  }, [searchTerm]);

  // ─────────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header com navegação */}
      <header className={styles['header-cards']}>
        <CategoriesNavigation
          onCategoryClick={handleCategoryClick}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onSearch={handleSearch}
        />
      </header>

      {/* Seções de categorias */}
      <section>
        {CATEGORIES.map((category) => (
          <CategorySection key={category.id} category={category} offers={offers[category.key]} />
        ))}
      </section>
    </div>
  );
};

export default CardsEntretenimento;
