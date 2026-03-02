/**
 * @fileoverview Componente de Perguntas Frequentes
 * @component FAQ
 * @description Página interativa com busca global, categorias filtráveis e accordion
 * Sistema completo de FAQ com navegação fluida entre categorias
 * @returns {JSX.Element} Componente renderizado
 */

import React, { useState, useEffect, useRef } from 'react';
import styles from '../../estilos/componentes/comuns/FAQ.module.css';
import {
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaWifi,
  FaPlay,
  FaMobileAlt,
  FaUserEdit,
  FaExchangeAlt,
  FaUserFriends,
  FaShieldAlt,
  FaTabletAlt,
  FaHeadset,
  FaInfoCircle,
} from 'react-icons/fa';
import { getTexto, getTemaConteudosByTipo } from '../../servicos/tema';

// ═══════════════════════════════════════════════════════════════════════════════

/**
 * EFEITOS
 * ─────────────────────────────────────────────────────────────────────────────
 * Configuração de referências compartilhadas
 */

// Referência para input de busca (acesso direto ao DOM)
const SEARCH_INPUT_REF = React.createRef();

// ═══════════════════════════════════════════════════════════════════════════════

/**
 * FUNÇÕES AUXILIARES
 * ─────────────────────────────────────────────────────────────────────────────
 * Lógica reutilizável para operações comuns
 */

/**
 * Retorna lista de categorias com ícones configurados
 * @returns {Array<Object>} Array com id, name e icon de cada categoria
 */
const getCategoriesWithIcons = () => [
  { id: 'internet', name: getTexto('faq.categories', 'internet', 'Internet'), icon: <FaWifi /> },
  { id: 'oniplay', name: getTexto('faq.categories', 'oniplay', 'Oni Play'), icon: <FaPlay /> },
  { id: 'oni5g', name: getTexto('faq.categories', 'oni5g', 'Oni 5G'), icon: <FaMobileAlt /> },
  { id: 'dados', name: getTexto('faq.categories', 'dados', 'Meus Dados'), icon: <FaUserEdit /> },
  { id: 'planos', name: getTexto('faq.categories', 'planos', 'Planos'), icon: <FaExchangeAlt /> },
  {
    id: 'indicacao',
    name: getTexto('faq.categories', 'indicacao', 'Indicação'),
    icon: <FaUserFriends />,
  },
  {
    id: 'seguranca',
    name: getTexto('faq.categories', 'seguranca', 'Segurança'),
    icon: <FaShieldAlt />,
  },
  {
    id: 'aplicativos',
    name: getTexto('faq.categories', 'aplicativos', 'Aplicativos'),
    icon: <FaTabletAlt />,
  },
  { id: 'suporte', name: getTexto('faq.categories', 'suporte', 'Suporte'), icon: <FaHeadset /> },
];

/**
 * Executa busca em todas as categorias de FAQ
 * @param {string} searchTerm - Termo para buscar
 * @param {Array<Object>} categories - Lista de categorias disponíveis
 * @returns {Array<Object>} Array com resultados encontrados
 */
const performFaqSearch = (searchTerm, categories) => {
  const faqConteudos = getTemaConteudosByTipo('faq');
  // Transforma array de conteúdos em objeto por categoria
  const faqData = faqConteudos.reduce((acc, item) => {
    const categoryId = item.categoria || 'geral';
    if (!acc[categoryId]) acc[categoryId] = [];
    const dados = item.dados || {};
    acc[categoryId].push({
      id: dados.id || item.id,
      question: dados.question || '',
      answer: dados.answer || '',
    });
    return acc;
  }, {});
  const results = [];

  Object.entries(faqData).forEach(([categoryId, questions]) => {
    const categoryName = categories.find((c) => c.id === categoryId)?.name || categoryId;
    const matchingQuestions = questions.filter(
      (q) =>
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    matchingQuestions.forEach((q) => {
      results.push({ categoryId, categoryName, ...q });
    });
  });

  return results;
};

/**
 * Realiza scroll suave até elemento no DOM
 * @param {string} elementId - ID do elemento alvo
 */
const scrollToElement = (elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════

/**
 * SUB-COMPONENTES
 * ─────────────────────────────────────────────────────────────────────────────
 * Componentes independentes reutilizáveis
 */

/**
 * Cabeçalho com logo e título principal
 * @component
 */
const FAQHeader = () => (
  <div className={styles.header}>
    <div className={styles.logo}>
      <span className={styles.logoText}>Oni</span>
      <span className={styles.logoAccent}>telecom</span>
    </div>
    <h1 className={styles.title}>{getTexto('faq', 'title', 'Perguntas Frequentes')}</h1>
  </div>
);

/**
 * Barra de pesquisa interativa com resultados em tempo real
 * @component
 * @param {Object} props - Props do componente
 */
const FAQSearchBar = ({
  searchTerm,
  setSearchTerm,
  searchResults,
  isSearching,
  showSearchResults,
  selectFromSearch,
  focusSearchInput,
}) => (
  <div className={styles.searchContainer}>
    <div className={styles.searchWrapper}>
      <FaSearch className={styles.searchIcon} />
      <input
        ref={SEARCH_INPUT_REF}
        type="text"
        className={styles.searchInput}
        placeholder={getTexto('faq', 'search_placeholder', 'Buscar perguntas...')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <button
          className={styles.clearButton}
          onClick={() => setSearchTerm('')}
          aria-label="Limpar pesquisa"
        >
          ×
        </button>
      )}
    </div>

    {showSearchResults && (
      <div className={styles.searchResults}>
        <div className={styles.searchResultsHeader}>
          {isSearching ? (
            <div className={styles.searchingIndicator}>Pesquisando...</div>
          ) : (
            <div className={styles.resultsCount}>
              {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado
              {searchResults.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {searchResults.length > 0 ? (
          <ul className={styles.resultsList}>
            {searchResults.map((result) => (
              <li
                key={result.id}
                className={styles.resultItem}
                onClick={() => selectFromSearch(result.categoryId, result.id)}
                role="button"
                tabIndex={0}
              >
                <div className={styles.resultCategory}>{result.categoryName}</div>
                <div className={styles.resultQuestion}>{result.question}</div>
              </li>
            ))}
          </ul>
        ) : (
          !isSearching && (
            <div className={styles.noResults}>
              <FaInfoCircle className={styles.noResultsIcon} />
              <p>
                {getTexto('faq', 'nenhumResultado', 'Nenhum resultado encontrado para')} "
                {searchTerm}"
              </p>
              <p>
                {getTexto(
                  'faq',
                  'dicaBusca',
                  'Tente usar termos diferentes ou navegue pelas categorias'
                )}
              </p>
            </div>
          )
        )}
      </div>
    )}
  </div>
);

/**
 * Menu lateral com categorias de FAQ
 * @component
 * @param {Object} props - Props do componente
 */
const FAQCategoriesMenu = ({ categories, activeCategory, setActiveCategory }) => (
  <div className="col-lg-3 col-md-4">
    <div className={styles.categoriesContainer}>
      <h3 className={styles.categoriesTitle}>
        {getTexto('faq', 'categories_title', 'Principais temas')}
      </h3>
      <ul className={styles.categoriesList}>
        {categories.map((category) => (
          <li
            key={category.id}
            className={`${styles.categoryItem} ${
              activeCategory === category.id ? styles.active : ''
            }`}
            onClick={() => setActiveCategory(category.id)}
            role="button"
            tabIndex={0}
          >
            <span className={styles.categoryIcon}>{category.icon}</span>
            <span className={styles.categoryName}>{category.name}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

/**
 * Item individual de FAQ com accordion
 * @component
 * @param {Object} props - Props do componente
 */
const FAQItem = ({ item, isExpanded, toggleQuestion }) => (
  <div id={item.id} className={`${styles.faqItem} ${isExpanded ? styles.expanded : ''}`}>
    <div
      className={styles.faqQuestion}
      onClick={() => toggleQuestion(item.id)}
      role="button"
      tabIndex={0}
    >
      <span>{item.question}</span>
      <span className={styles.faqToggle}>{isExpanded ? <FaChevronUp /> : <FaChevronDown />}</span>
    </div>

    <div className={styles.faqAnswer}>
      <p>{item.answer}</p>
    </div>
  </div>
);

/**
 * Container principal de FAQs
 * @component
 * @param {Object} props - Props do componente
 */
const FAQContent = ({ activeCategory, expandedQuestions, toggleQuestion, focusSearchInput }) => {
  const faqConteudos = getTemaConteudosByTipo('faq');
  // Transforma array de conteúdos em objeto por categoria
  const faqData = faqConteudos.reduce((acc, item) => {
    const categoryId = item.categoria || 'geral';
    if (!acc[categoryId]) acc[categoryId] = [];
    const dados = item.dados || {};
    acc[categoryId].push({
      id: dados.id || item.id,
      question: dados.question || '',
      answer: dados.answer || '',
    });
    return acc;
  }, {});
  const categories = getCategoriesWithIcons();
  const categoryName =
    categories.find((c) => c.id === activeCategory)?.name || 'Perguntas Frequentes';
  const categoryFaqs = faqData[activeCategory] || [];

  return (
    <div className="col-lg-9 col-md-8">
      <div className={styles.faqContainer}>
        <h2 className={styles.faqTitle}>{categoryName}</h2>

        <div className={styles.faqList}>
          {categoryFaqs.length > 0 ? (
            categoryFaqs.map((item) => (
              <FAQItem
                key={item.id}
                item={item}
                isExpanded={expandedQuestions[item.id] || false}
                toggleQuestion={toggleQuestion}
              />
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>
                {getTexto('faq', 'empty_state', 'Não há perguntas frequentes para esta categoria.')}
              </p>
              <button className={styles.searchButton} onClick={focusSearchInput}>
                {getTexto('faq', 'search_all', 'Pesquisar em todas as categorias')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Rodapé com chamada para ação
 * @component
 */
const FAQFooter = () => (
  <div className={styles.footer}>
    <p>
      {getTexto('faq', 'footer_question', 'Não encontrou o que procurava?')}{' '}
      <a href="/contato" className={styles.footerLink}>
        {getTexto('faq', 'footer_contact', 'Entre em contato com nosso suporte')}
      </a>
    </p>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════

/**
 * COMPONENTE PRINCIPAL
 * ─────────────────────────────────────────────────────────────────────────────
 * Gerenciamento de estado e orquestração dos sub-componentes
 */

function FAQ() {
  // ─────────────────────────────────────────────────────────────────────────
  // Estado
  // ─────────────────────────────────────────────────────────────────────────

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('internet');
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const categories = getCategoriesWithIcons();

  // ─────────────────────────────────────────────────────────────────────────
  // Efeitos
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Efeito: Executar busca quando termo muda
   * Realiza debounce de 300ms para melhor performance
   */
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);

    const timer = setTimeout(() => {
      const results = performFaqSearch(searchTerm, categories);
      setSearchResults(results);
      setShowSearchResults(true);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ─────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Alterna estado de expansão de uma pergunta
   * @param {string} questionId - ID da pergunta
   */
  const handleToggleQuestion = (questionId) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  /**
   * Foca na barra de pesquisa
   */
  const handleFocusSearch = () => {
    SEARCH_INPUT_REF.current?.focus();
  };

  /**
   * Seleciona resultado de pesquisa e navega
   * @param {string} categoryId - ID da categoria
   * @param {string} questionId - ID da pergunta
   */
  const handleSelectFromSearch = (categoryId, questionId) => {
    setActiveCategory(categoryId);
    setSearchTerm('');
    setShowSearchResults(false);

    setTimeout(() => {
      setExpandedQuestions((prev) => ({
        ...prev,
        [questionId]: true,
      }));
      scrollToElement(questionId);
    }, 100);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className={styles.container}>
      <FAQHeader />

      <div className="container">
        <FAQSearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchResults={searchResults}
          isSearching={isSearching}
          showSearchResults={showSearchResults}
          selectFromSearch={handleSelectFromSearch}
          focusSearchInput={handleFocusSearch}
        />

        <div className="row">
          <FAQCategoriesMenu
            categories={categories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />

          <FAQContent
            activeCategory={activeCategory}
            expandedQuestions={expandedQuestions}
            toggleQuestion={handleToggleQuestion}
            focusSearchInput={handleFocusSearch}
          />
        </div>
      </div>

      <FAQFooter />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════

export default FAQ;
