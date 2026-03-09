/**
 * @fileoverview Componente Header - Cabeçalho dinâmico com navegação responsiva
 * @component
 * @description
 * Renderiza um header completo com:
 * - Barra superior com navegação, ícones sociais e acesso à central
 * - Logo e menu de navegação dinamicamente carregado da API
 * - Botões de ação (Pagar Fatura, Assine Agora, Telefone)
 * - Menu mobile responsivo com toggle
 * - Suporte a rotas internas (React Router) e URLs externas
 * @returns {React.ReactElement} Header completo com TopBar, MainNav e MobileNav
 */

import React, { useState, useEffect } from 'react';
import {
  FaBars,
  FaTimes,
  FaUser,
  FaPhone,
  FaHome,
  FaBrain,
  FaNetworkWired,
  FaWifi,
  FaBolt,
  FaFileContract,
  FaTv,
  FaStore,
  FaCity,
  FaCog,
  FaUsers,
  FaQuestionCircle,
  FaBuilding,
  FaPlay,
} from 'react-icons/fa';
import { FaWhatsapp, FaInstagram, FaFacebook } from 'react-icons/fa';

import styles from '../../estilos/componentes/comuns/Header.module.css';
import { Link } from 'react-router-dom';
import { getTemaPaginas, getTexto, getImagem, getLink, getMenuLinks } from '../../servicos/tema';

// ═════════════════════════════════════════════════════════════════════════════════════
//  MAPEAMENTO DE ÍCONES (react-icons)
// ═════════════════════════════════════════════════════════════════════════════════════

/** @constant {Object} Mapeamento de nomes de ícones da API para componentes react-icons */
const ICON_MAP = {
  FaHome,
  FaBrain,
  FaNetworkWired,
  FaWifi,
  FaBolt,
  FaPhone,
  FaFileContract,
  FaTv,
  FaStore,
  FaCity,
  FaCog,
  FaUsers,
  FaQuestionCircle,
  FaBuilding,
  FaPlay,
  FaUser,
  // Compatíveis com nomes antigos (lowercase)
  home: FaHome,
  wifi: FaWifi,
  building: FaBuilding,
  play: FaPlay,
};

/** @constant {Function} Ícone padrão para elementos de menu */
const DefaultIcon = FaHome;

// ═════════════════════════════════════════════════════════════════════════════════════
// 🛠️  FUNÇÕES AUXILIARES
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Obtém componente de ícone react-icons baseado no nome que vem da API
 * @param {string} iconName - Nome do ícone (ex: 'FaHome', 'FaWifi')
 * @returns {React.ComponentType} Componente de ícone react-icons
 */
const getIconComponent = (iconName) => {
  if (!iconName) return DefaultIcon;
  return ICON_MAP[iconName] || DefaultIcon;
};

/**
 * Renderiza um ícone dinamicamente baseado no nome da API
 * @param {string} iconName - Nome do ícone
 * @param {Object} props - Props adicionais para o ícone
 * @returns {React.ReactElement} Elemento de ícone renderizado
 */
const DynamicIcon = ({ name, ...props }) => {
  const IconComponent = getIconComponent(name);
  return <IconComponent {...props} />;
};

/**
 * Obtém itens de menu dinâmicos da API
 * @param {string} menuName - Nome do menu ('Main Nav', 'Mobile Nav', 'Top Bar')
 * @returns {Array<Object>} Array com { path, menuLabel, name, icone, external }
 */
const getMenuItemsFromAPI = (menuName) => {
  try {
    const menuItems = getMenuLinks(menuName);
    if (!menuItems?.length) return [];

    return menuItems.map((item, index) => ({
      path: item.route,
      menuLabel: item.label,
      name: `${menuName}-${index}`,
      iconName: item.icon, // Guarda o nome do ícone da API
      external: item.external || false,
    }));
  } catch (error) {
    // eslint-disable-next-line no-console

    // eslint-disable-next-line no-console
    console.error(`Erro ao obter menu '${menuName}':`, error);
    return [];
  }
};

/**
 * Obtém itens de menu dinâmicos habilitados na API (fallback para paginas)
 * Filtra páginas com mostrarNoMenu=true e ordena por ordemMenu
 * @returns {Array<Object>} Array com { path, menuLabel, name, icone }
 */
const getMenuItems = () => {
  // Primeiro tenta usar os links de menu da API
  const mainNavItems = getMenuItemsFromAPI('Main Nav');
  if (mainNavItems.length > 0) return mainNavItems;

  // Fallback: usa getTemaPaginas
  try {
    const paginas = getTemaPaginas();
    if (!paginas?.length) return [];

    return paginas
      .filter((pagina) => pagina.mostrarNoMenu === true)
      .sort((a, b) => (a.ordemMenu || 999) - (b.ordemMenu || 999))
      .map((pagina) => ({
        path: pagina.caminho,
        menuLabel: pagina.etiquetaMenu,
        name: pagina.nome,
        iconName: pagina.icone, // Guarda o nome do ícone da API
      }));
  } catch (error) {
    // eslint-disable-next-line no-console

    // eslint-disable-next-line no-console
    console.error('Erro ao obter itens do menu:', error);
    return [];
  }
};

/**
 * Verifica se um elemento está habilitado no header da API
 * @param {string} elementName - Nome do elemento a verificar
 * @returns {boolean} true se elemento está habilitado
 */
const isElementEnabled = (elementName) => {
  try {
    const paginas = getTemaPaginas();
    if (!paginas?.length) return false;

    const paginaInicio = paginas.find((p) => p.nome === 'inicio');
    if (!paginaInicio?.componentes) return false;

    const componenteHeader = paginaInicio.componentes.find((c) => c.nome === 'header');
    if (!componenteHeader?.elementos) return false;

    return componenteHeader.elementos.some(
      (el) =>
        el.nome === elementName && el.habilitado === true && el.habilitadoNoComponente === true
    );
  } catch (error) {
    // eslint-disable-next-line no-console

    // eslint-disable-next-line no-console
    console.error(`Erro ao verificar elemento '${elementName}':`, error);
    return false;
  }
};

/**
 * Renderiza um link de menu com suporte a rotas internas e externas
 * @param {Object} item - Objeto com { path, menuLabel, name, iconName }
 * @param {boolean} isMobile - Se true, aplica estilos mobile
 * @returns {React.ReactElement} Link renderizado
 */
const renderMenuLink = (item, isMobile = false, showIcon = true) => {
  const linkClassName = isMobile ? styles['menu-item'] : undefined;
  const content = showIcon ? (
    <>
      <DynamicIcon name={item.iconName} /> {item.menuLabel}
    </>
  ) : (
    item.menuLabel
  );

  const isInternalRoute =
    !item.external && item.path?.startsWith('/') && !item.path?.includes('http');

  return isInternalRoute ? (
    <Link to={item.path} className={linkClassName} key={item.name}>
      {content}
    </Link>
  ) : (
    <a
      href={item.path}
      className={linkClassName}
      key={item.name}
      target={item.external ? '_blank' : undefined}
      rel={item.external ? 'noopener noreferrer' : undefined}
    >
      {content}
    </a>
  );
};

// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * TopBar - Barra superior com navegação rápida e redes sociais
 * @returns {React.ReactElement}
 */
const TopBar = ({ isMobileNavActive, onToggleMobileNav }) => {
  const topBarItems = getMenuItemsFromAPI('Top Bar');

  return (
    isElementEnabled('topBar') && (
      <div className={styles['top-bar']}>
        <div className="container-fluid">
          <div className="row align-items-center">
            {/* Botão de menu mobile */}
            <div className="col-auto d-lg-none">
              <button
                className={styles['abrir-menu']}
                onClick={onToggleMobileNav}
                aria-label="Abrir menu"
                aria-expanded={isMobileNavActive}
                data-mobile-toggle
              >
                <FaBars />
              </button>
            </div>

            {/* Navegação desktop */}
            <div className="col d-none d-lg-block">
              <nav className={styles['top-nav']} role="navigation" aria-label="Informações gerais">
                {topBarItems.map((item, index) => (
                  <React.Fragment key={item.name}>
                    {index > 0 && <span className={styles.separator}>|</span>}
                    {renderMenuLink(item, false, true)}
                  </React.Fragment>
                ))}
              </nav>
            </div>

            {/* Ícones e links direita */}
            <div className="col-auto">
              <div className={styles['top-right-icons']}>
                <a
                  href={getLink('externa', 'Central Assinante')}
                  className={`${styles.button} ${styles['central-assinante']} d-none d-lg-inline-block`}
                  title="Central do Assinante"
                >
                  {getTexto('header', 'topBar_centralAssinante', 'Central do Assinante')}
                </a>
                <a href={getLink('social', 'WhatsApp')} aria-label="WhatsApp" title="WhatsApp">
                  <FaWhatsapp />
                </a>
                <a href={getLink('social', 'Instagram')} aria-label="Instagram" title="Instagram">
                  <FaInstagram />
                </a>
                <a href={getLink('social', 'Facebook')} aria-label="Facebook" title="Facebook">
                  <FaFacebook />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

/**
 * MainNav - Navegação principal com logo e menu
 * @returns {React.ReactElement}
 */
const MainNav = () => (
  <div className={styles['main-header']}>
    <div className="container-fluid">
      <div className="row align-items-center">
        {/* Logo */}
        <div className="col-auto">
          <div className={styles.logo}>
            <Link to="/" aria-label="Página inicial">
              <img src={getImagem('logos', 'Header')} alt={getTexto('company', 'name', 'ONI')} />
            </Link>
          </div>
        </div>

        {/* Menu desktop */}
        <div className="col d-none d-lg-block">
          <nav className={styles['main-nav']} role="navigation" aria-label="Menu principal">
            {getMenuItems().map((item) => renderMenuLink(item, false))}
          </nav>
        </div>

        {/* Login button */}
        {isElementEnabled('loginButton') && (
          <div className="col-auto d-none d-lg-block">
            <Link
              to="/login"
              className={`${styles.button} ${styles['login-button']}`}
              aria-label={getTexto('header', 'loginButton_aria', 'Acessar minha conta')}
              title="Minha Conta"
            >
              <FaUser /> {getTexto('header', 'loginButton_text', 'Minha Conta')}
            </Link>
          </div>
        )}

        {/* Botões de ação */}
        <div className="col-auto d-none d-lg-block">
          <div className={styles['header-buttons']}>
            <a
              href="/pagar-fatura"
              className={`${styles.button} ${styles['pagar-fatura']}`}
              title="Pagar Fatura"
            >
              {getTexto('header', 'buttons_pagarFatura', 'Pagar Fatura')}
            </a>
            <a
              href={getLink('externa', 'Assine Agora')}
              className={`${styles.button} ${styles['assine-agora']}`}
              title="Assine Agora"
            >
              {getTexto('header', 'buttons_assineAgora', 'Assine Agora')}
            </a>
            {/* <a
              href={`tel:${getLink('telefone', 'Support')}`}
              className={styles['phone-number']}
              title={`Ligar: ${getLink('telefone', 'Support Formatted')}`}
            >
              <FaPhone /> {getLink('telefone', 'Support Formatted')}
            </a> */}
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * MobileNav - Navegação mobile com menu e ícones sociais
 * @returns {React.ReactElement}
 */
const MobileNav = ({ isActive, onClose }) => {
  // Primeiro tenta usar os links de 'Mobile Nav', senão usa os de 'Main Nav'
  const mobileItems =
    getMenuItemsFromAPI('Mobile Nav').length > 0
      ? getMenuItemsFromAPI('Mobile Nav')
      : getMenuItems();

  return (
    <nav
      className={`${styles['mobile-nav']} ${isActive ? styles.active : ''}`}
      role="navigation"
      aria-label="Menu mobile"
      inert={!isActive ? '' : undefined}
      data-mobile-nav
    >
      {/* Botão fechar */}
      <button
        className={styles['close-menu']}
        onClick={onClose}
        aria-label="Fechar menu"
        title="Fechar"
      >
        <FaTimes />
      </button>

      {/* Logo mobile */}
      <img
        src={getImagem('logos', 'Main')}
        alt={getTexto('company', 'name', 'ONI')}
        className={styles['logo-mobile']}
      />

      {/* Menu items */}
      {mobileItems.map((item) => renderMenuLink(item, true))}

      {/* Ícones sociais */}
      <div className={styles['mobile-icons']}>
        <a
          href={getLink('social', 'WhatsApp')}
          className={styles['icon-link']}
          aria-label="WhatsApp"
          title="WhatsApp"
        >
          <FaWhatsapp />
        </a>
        <a
          href={getLink('social', 'Instagram')}
          className={styles['icon-link']}
          aria-label="Instagram"
          title="Instagram"
        >
          <FaInstagram />
        </a>
        <a
          href={getLink('social', 'Facebook')}
          className={styles['icon-link']}
          aria-label="Facebook"
          title="Facebook"
        >
          <FaFacebook />
        </a>
      </div>
    </nav>
  );
};

// ═════════════════════════════════════════════════════════════════════════════════════
// 📱 COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Componente Header - Cabeçalho dinâmico responsivo
 * @returns {React.ReactElement}
 */
const Header = () => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────────────

  const [isMobileNavActive, setIsMobileNavActive] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Fecha menu mobile ao clicar fora
   */
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        isMobileNavActive &&
        !event.target.closest('[data-mobile-nav]') &&
        !event.target.closest('[data-mobile-toggle]')
      ) {
        setIsMobileNavActive(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isMobileNavActive]);

  // ─────────────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Alterna visibilidade do menu mobile
   */
  const handleToggleMobileNav = () => {
    setIsMobileNavActive(!isMobileNavActive);
  };

  /**
   * Fecha menu mobile
   */
  const handleCloseMobileNav = () => {
    setIsMobileNavActive(false);
  };

  // ─────────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────────

  return (
    <>
      <header role="banner">
        <TopBar isMobileNavActive={isMobileNavActive} onToggleMobileNav={handleToggleMobileNav} />
        <MainNav />
      </header>
      <MobileNav isActive={isMobileNavActive} onClose={handleCloseMobileNav} />
    </>
  );
};

export default Header;
