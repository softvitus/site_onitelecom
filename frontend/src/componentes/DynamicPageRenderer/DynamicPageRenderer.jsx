/**
 * @fileoverview Componente DynamicPageRenderer - Renderizador dinâmico de páginas
 * @component
 * @description
 * Renderiza componentes dinamicamente baseado na configuração da API:
 * - Busca componentes habilitados via getTemaComponentesByPagina()
 * - Mapeia nomes da API para componentes React
 * - Suporta wrappers CSS customizados por componente
 * - Suporta props customizadas por componente
 * - Header e Footer já vêm inclusos no array da API com suas ordens
 *
 * @example
 * // Uso básico
 * <DynamicPageRenderer pagePath="/" />
 *
 * @example
 * // Com customizações
 * <DynamicPageRenderer
 *   pagePath="/internet"
 *   customWrappers={{ carousel: 'carouselWrapper' }}
 *   customProps={{ ofertas: { showFilters: true } }}
 *   debug={true}
 * />
 *
 * @param {Object} props - Props do componente
 * @param {string} props.pagePath - Caminho da página (ex: '/', '/internet')
 * @param {Object} [props.customWrappers] - Classes CSS wrapper por componente
 * @param {Object} [props.customProps] - Props adicionais por componente
 * @param {boolean} [props.debug] - Ativa logs de debug no console
 * @returns {React.ReactElement} Página renderizada dinamicamente
 */

import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getTemaComponentesByPagina, getTexto } from '../../servicos/tema';

// ═════════════════════════════════════════════════════════════════════════════════════
// IMPORTAÇÕES DE COMPONENTES
// ═════════════════════════════════════════════════════════════════════════════════════

// Layout
import Header from '../comuns/Header';
import Footer from '../comuns/Footer';

// Seções principais
import Carousel from '../comuns/Carrossel';
import Banner from '../comuns/Banner';
import Introducao from '../comuns/Introducao';
import DivisorSecao from '../comuns/DivisorSecao';

// Ofertas e planos
import Ofertas from '../comuns/Ofertas';
import OfertasChips from '../comuns/OfertasChips';
import FaixaPlanos from '../comuns/FaixaPlanos';
import PlanoControle from '../comuns/PlanoControle';

// Serviços
import ServicosEssenciais from '../comuns/ServicosEssenciais';
import ServicosEssenciaisInternet from '../comuns/ServicosEssenciaisInternet';
import Servicos from '../comuns/Servicos';

// Entretenimento e recursos
import CardsEntretenimento from '../comuns/CardsEntretenimento';
import AppExclusivo from '../comuns/AppExclusivo';
import InfinitePossibilities from '../comuns/InfinitePossibilities';
import TelefoniaBanner from '../comuns/TelefoniaBanner';

// Institucional
import QuemSomos from '../comuns/QuemSomos';
import PorQueEscolher from '../comuns/PorQueEscolher';
import Depoimentos from '../comuns/Depoimentos';

// Suporte e contato
import Contato from '../comuns/Contato';
import HelpSection from '../comuns/HelpSection';
import FAQ from '../comuns/FAQ';

// ═════════════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÕES
// ═════════════════════════════════════════════════════════════════════════════════════

/** @constant {boolean} Modo debug global (desabilitado para console limpo) */
const DEBUG_MODE = false;

/**
 * @constant {Object} COMPONENT_REGISTRY
 * @description Mapa que conecta nomes de componentes da API com componentes React
 * IMPORTANTE: Manter sincronizado com os nomes no backend (tabela componentes)
 */
const COMPONENT_REGISTRY = {
  // Layout
  header: Header,
  footer: Footer,

  // Seções principais
  carousel: Carousel,
  banner: Banner,
  introducao: Introducao,
  divisorSecao: DivisorSecao,

  // Ofertas e planos
  ofertas: Ofertas,
  ofertaschips: OfertasChips,
  faixaPlanos: FaixaPlanos,
  planoControle: PlanoControle,

  // Serviços
  servicosEssenciais: ServicosEssenciais,
  servicosEssenciaisInternet: ServicosEssenciaisInternet,
  servicos: Servicos,

  // Entretenimento e recursos
  cardsEntretenimento: CardsEntretenimento,
  appExclusivo: AppExclusivo,
  infinitePossibilities: InfinitePossibilities,
  telefoniaBanner: TelefoniaBanner,

  // Institucional
  quemsomos: QuemSomos,
  porQueEscolher: PorQueEscolher,
  depoimentos: Depoimentos,

  // Suporte e contato
  contato: Contato,
  helpSection: HelpSection,
  faq: FAQ,
};

/** @constant {Array<string>} Lista de componentes disponíveis para validação */
const AVAILABLE_COMPONENTS = Object.keys(COMPONENT_REGISTRY);

// ═════════════════════════════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Logger condicional para debug
 * @param {string} type - Tipo de log ('info', 'warn', 'error')
 * @param {string} message - Mensagem a ser logada
 * @param {*} [data] - Dados adicionais
 * @param {boolean} debug - Flag de debug
 */
const logger = (type, message, data = null, debug = false) => {
  if (!debug && !DEBUG_MODE) return;

  const styles = {
    info: 'color: #4CAF50; font-weight: bold;',
    warn: 'color: #FF9800; font-weight: bold;',
    error: 'color: #f44336; font-weight: bold;',
  };

  const icons = { info: '[OK]', warn: '[WARN]', error: '[ERROR]' };

  // eslint-disable-next-line no-console
  console[type](`%c${icons[type]} ${message}`, styles[type], data || '');
};

/**
 * Verifica se um componente está registrado
 * @param {string} componentName - Nome do componente
 * @returns {boolean} True se o componente existe no registro
 */
const isComponentRegistered = (componentName) => {
  return componentName in COMPONENT_REGISTRY;
};

/**
 * Obtém o componente React pelo nome
 * @param {string} componentName - Nome do componente da API
 * @returns {React.ComponentType|null} Componente React ou null
 */
const getComponentByName = (componentName) => {
  return COMPONENT_REGISTRY[componentName] || null;
};

// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * EmptyState - Componente exibido quando não há componentes configurados
 * @param {Object} props - Props do componente
 * @param {string} props.pagePath - Caminho da página
 * @returns {React.ReactElement}
 */
const EmptyState = ({ pagePath }) => (
  <div
    className="dynamic-page-empty"
    style={{
      padding: '60px 20px',
      textAlign: 'center',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      margin: '20px',
    }}
  >
    <h2 style={{ color: '#6c757d', marginBottom: '10px' }}>
      {getTexto('messages', 'paginaVazia', 'Página em construção')}
    </h2>
    <p style={{ color: '#adb5bd' }}>
      {getTexto('messages', 'nenhumComponente', 'Nenhum componente configurado para esta página.')}
    </p>
    {DEBUG_MODE && <code style={{ fontSize: '12px', color: '#868e96' }}>pagePath: {pagePath}</code>}
  </div>
);

EmptyState.propTypes = {
  pagePath: PropTypes.string.isRequired,
};

// ═════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * DynamicPageRenderer - Renderiza páginas dinamicamente baseado na API
 * @param {Object} props - Props do componente
 * @returns {React.ReactElement}
 */
const DynamicPageRenderer = ({
  pagePath,
  customWrappers = {},
  customProps = {},
  debug = false,
}) => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // MEMOIZAÇÃO
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Busca e memoriza os componentes da página
   */
  const componentes = useMemo(() => {
    const result = getTemaComponentesByPagina(pagePath);

    logger(
      'info',
      `Página "${pagePath}" - ${result?.length || 0} componentes encontrados`,
      null,
      debug
    );

    return result || [];
  }, [pagePath, debug]);

  // ─────────────────────────────────────────────────────────────────────────────────
  // CALLBACKS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Renderiza um componente individual
   * @param {Object} componente - Dados do componente da API
   * @returns {React.ReactElement|null}
   */
  const renderComponente = useCallback(
    (componente) => {
      const { id, nome, ordem, habilitadoNaPagina } = componente;

      // Valida se o componente existe no registro
      if (!isComponentRegistered(nome)) {
        logger(
          'error',
          `Componente não mapeado: "${nome}"`,
          {
            id,
            disponíveis: AVAILABLE_COMPONENTS,
          },
          debug
        );
        return null;
      }

      // Obtém o componente React
      const ComponenteReact = getComponentByName(nome);

      // Log de renderização
      logger('info', `Renderizando: "${nome}"`, { ordem, habilitadoNaPagina }, debug);

      // Props específicas para este componente
      const componenteProps = customProps[nome] || {};

      return <ComponenteReact key={id} {...componenteProps} />;
    },
    [customProps, debug]
  );

  /**
   * Envolve componente com wrapper CSS se necessário
   * @param {Object} componente - Dados do componente
   * @param {React.ReactElement} conteudo - Elemento renderizado
   * @returns {React.ReactElement}
   */
  const wrapComponent = useCallback(
    (componente, conteudo) => {
      const wrapper = customWrappers[componente.nome];

      if (!wrapper || !conteudo) return conteudo;

      return (
        <div key={`wrapper-${componente.id}`} className={wrapper}>
          {conteudo}
        </div>
      );
    },
    [customWrappers]
  );

  // ─────────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────────

  // Estado vazio
  if (!componentes.length) {
    logger('warn', `Nenhum componente para: ${pagePath}`, null, debug);
    return <EmptyState pagePath={pagePath} />;
  }

  return (
    <main className="dynamic-page" role="main">
      {componentes.map((componente) => {
        const conteudo = renderComponente(componente);

        if (!conteudo) return null;

        return wrapComponent(componente, conteudo);
      })}
    </main>
  );
};

// ═════════════════════════════════════════════════════════════════════════════════════
// PROP TYPES & DEFAULT PROPS
// ═════════════════════════════════════════════════════════════════════════════════════

DynamicPageRenderer.propTypes = {
  /** Caminho da página para buscar componentes (ex: '/', '/internet') */
  pagePath: PropTypes.string.isRequired,

  /** Mapa de wrappers CSS por nome de componente */
  customWrappers: PropTypes.objectOf(PropTypes.string),

  /** Mapa de props customizadas por nome de componente */
  customProps: PropTypes.objectOf(PropTypes.object),

  /** Ativa logs de debug no console */
  debug: PropTypes.bool,
};

// ═════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═════════════════════════════════════════════════════════════════════════════════════

export default DynamicPageRenderer;

/** @exports Utilitários para uso externo */
export { COMPONENT_REGISTRY, AVAILABLE_COMPONENTS, isComponentRegistered, getComponentByName };
