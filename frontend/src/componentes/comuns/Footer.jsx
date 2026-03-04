/**
 * @fileoverview Componente Footer - Rodapé dinâmico unificado
 * @component
 * @description
 * Renderiza um rodapé completo com:
 * - Logo da empresa e redes sociais
 * - Colunas de navegação (Institucional, Planos, Contato, Apps)
 * - Informações da empresa com CTAs
 * - Seletor de estado/cidade com geolocalização
 * - Copyright e créditos do desenvolvedor
 * @returns {React.ReactElement} Footer completo e dinâmico
 */

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFacebookF,
  faInstagram,
  faWhatsapp,
  faApple,
  faGooglePlay,
} from '@fortawesome/free-brands-svg-icons';
import styles from '../../estilos/componentes/comuns/Footer.module.css';
import {
  getTemaPaginas,
  getTexto,
  getImagem,
  getLink,
  getTemaLinksByCategoria,
} from '../../servicos/tema';

// ═════════════════════════════════════════════════════════════════════════════════════
// 📍 DADOS DE LOCALIDADES (HARDCODED)
// ═════════════════════════════════════════════════════════════════════════════════════

/** Dados de localidades e parceiros por cidade */
const LOCATIONS = Object.freeze({
  'joao-pessoa': {
    id: 'joao-pessoa',
    city: 'João Pessoa',
    state: 'PB',
    partner: 'onitelecom',
    coordinates: { lat: -7.1156, lng: -34.8781 },
    active: true,
  },
  'campina-grande': {
    id: 'campina-grande',
    city: 'Campina Grande',
    state: 'PB',
    partner: 'onitelecom',
    coordinates: { lat: -7.231, lng: -35.8811 },
    active: true,
  },
  patos: {
    id: 'patos',
    city: 'Patos',
    state: 'PB',
    partner: 'internet-mais',
    coordinates: { lat: -7.0788, lng: -36.6633 },
    active: true,
  },
  corema: {
    id: 'corema',
    city: 'Corema',
    state: 'PB',
    partner: 'internet-mais',
    coordinates: { lat: -7.135, lng: -37.255 },
    active: true,
  },
});

/**
 * Agrupa localizações ativas por estado
 * @returns {Object} Estados com suas cidades
 */
const getLocationsByState = () => {
  const states = {};
  Object.values(LOCATIONS).forEach((loc) => {
    if (loc.active) {
      if (!states[loc.state]) states[loc.state] = [];
      states[loc.state].push({ id: loc.id, city: loc.city, state: loc.state });
    }
  });
  return states;
};

/** Obtém lista de estados disponíveis */
const getStates = () => Object.keys(getLocationsByState()).sort();

/** Obtém cidades de um estado */
const getCitiesByState = (state) => getLocationsByState()[state] || [];

/** Obtém localização mais próxima por coordenadas */
const getNearestLocation = (lat, lng) => {
  const active = Object.values(LOCATIONS).filter((l) => l.active);
  let nearest = null;
  let minDist = Infinity;
  active.forEach((loc) => {
    const dist = Math.sqrt(
      Math.pow(lat - loc.coordinates.lat, 2) + Math.pow(lng - loc.coordinates.lng, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      nearest = { ...loc, distance: dist };
    }
  });
  return nearest;
};

// ═════════════════════════════════════════════════════════════════════════════════════
// 🔧 CONSTANTES
// ═════════════════════════════════════════════════════════════════════════════════════

/** @constant {string} Chave localStorage para estado selecionado */
const LOCALSTORAGE_STATE_KEY = 'selectedState';

/** @constant {string} Chave localStorage para cidade selecionada */
const LOCALSTORAGE_CITY_KEY = 'selectedCity';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🛠️  FUNÇÕES AUXILIARES
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Carrega estados do localStorage ou API
 * @returns {Array<string>} Lista de estados disponíveis
 */
const loadStates = () => {
  return getStates();
};

/**
 * Carrega cidades de um estado
 * @param {string} state - UF do estado
 * @returns {Array<Object>} Lista de cidades com { id, city }
 */
const loadCitiesByState = (state) => {
  return getCitiesByState(state);
};

/**
 * Verifica se um elemento está habilitado no footer da API
 * @param {string} elementName - Nome do elemento a verificar
 * @returns {boolean} true se elemento está habilitado
 */
const isElementEnabled = (elementName) => {
  try {
    const paginas = getTemaPaginas();
    if (!paginas?.length) return false;

    const paginaInicio = paginas.find((p) => p.nome === 'inicio');
    if (!paginaInicio?.componentes) return false;

    const componenteFooter = paginaInicio.componentes.find((c) => c.nome === 'footer');
    if (!componenteFooter?.elementos) return false;

    return componenteFooter.elementos.some(
      (el) =>
        el.nome === elementName && el.habilitado === true && el.habilitadoNoComponente === true
    );
  } catch (error) {
    // eslint-disable-next-line no-console

    console.error(`Erro ao verificar elemento '${elementName}':`, error);
    return false;
  }
};

// ═════════════════════════════════════════════════════════════════════════════════════
// 📱 COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Componente Footer - Rodapé dinâmico unificado
 * @returns {React.ReactElement}
 */
const Footer = () => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────────────

  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Dados da empresa e desenvolvedor
  const cnpj = getLink('empresa', 'CNPJ', '');
  const licencaAnatel = getLink('empresa', 'Licença Anatel', '');
  const developerLogo = getImagem('brand', 'SOFT VIRTUS - 2', '');

  // ─────────────────────────────────────────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Carrega estados e recupera seleções do localStorage
   */
  useEffect(() => {
    const availableStates = loadStates();
    setStates(availableStates);

    const savedState = localStorage.getItem(LOCALSTORAGE_STATE_KEY);
    const savedCity = localStorage.getItem(LOCALSTORAGE_CITY_KEY);

    if (savedState && availableStates.includes(savedState)) {
      setSelectedState(savedState);
    } else if (availableStates.length > 0) {
      setSelectedState(availableStates[0] || '');
    }

    if (savedCity) {
      setSelectedCity(savedCity);
    }
  }, []);

  /**
   * Carrega cidades quando estado muda
   */
  useEffect(() => {
    if (selectedState) {
      const stateCities = loadCitiesByState(selectedState);
      setCities(stateCities);

      if (selectedCity && stateCities.some((c) => c.id === selectedCity)) {
        // Mantém seleção anterior
      } else if (stateCities.length > 0) {
        setSelectedCity(stateCities[0].id);
      }
    }
  }, [selectedState, selectedCity]);

  /**
   * Detecta e persiste geolocalização do usuário
   */
  useEffect(() => {
    const detectLocation = () => {
      if (!navigator.geolocation) {
        return;
      }

      setLoadingLocation(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const nearest = getNearestLocation(latitude, longitude);

          if (nearest) {
            setSelectedState(nearest.state);
            setSelectedCity(nearest.id);
            localStorage.setItem(LOCALSTORAGE_STATE_KEY, nearest.state);
            localStorage.setItem(LOCALSTORAGE_CITY_KEY, nearest.id);
          }
          setLoadingLocation(false);
        },
        () => {
          setLoadingLocation(false);
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    };

    const savedState = localStorage.getItem(LOCALSTORAGE_STATE_KEY);
    if (!savedState) {
      setTimeout(detectLocation, 500);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────────

  const handleStateChange = (e) => {
    const state = e.target.value;
    setSelectedState(state);
    localStorage.setItem(LOCALSTORAGE_STATE_KEY, state);
    setSelectedCity('');
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    localStorage.setItem(LOCALSTORAGE_CITY_KEY, city);
  };

  // ─────────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────────

  return (
    <footer className={styles['footer']} role="contentinfo" style={{ marginTop: 'auto' }}>
      <div className={styles['footer-main']}>
        {/* ═══════════════════════════════════════════════════════════════════════════
            SEÇÃO: LOGO + REDES SOCIAIS
        ═══════════════════════════════════════════════════════════════════════════ */}
        <div className={styles['footer-brand']}>
          <img
            src={getImagem('logos', 'main', '/logo.png')}
            alt={getTexto('company', 'name', 'ONI')}
            className={styles['footer-logo']}
          />

          {isElementEnabled('socialMedia') && (
            <div className={styles['footer-social']}>
              <a
                href={getLink('social', 'facebook', '#')}
                className={styles['social-icon']}
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a
                href={getLink('social', 'instagram', '#')}
                className={styles['social-icon']}
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a
                href={getLink('social', 'whatsapp', '#')}
                className={styles['social-icon']}
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <FontAwesomeIcon icon={faWhatsapp} />
              </a>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════════
            SEÇÃO: COLUNAS DE NAVEGAÇÃO
        ═══════════════════════════════════════════════════════════════════════════ */}
        {isElementEnabled('columns') && (
          <div className={styles['footer-nav']}>
            {/* Coluna: Institucional */}
            <div className={styles['footer-column']}>
              <h3>{getTexto('footer', 'columns_institucional_title', 'Institucional')}</h3>
              <ul>
                {getTemaLinksByCategoria('footerMenu').map((link, index) => (
                  <li key={index}>
                    <a href={link.href || '#'} title={link.nome}>
                      {link.nome}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Coluna: Planos */}
            <div className={styles['footer-column']}>
              <h3>{getTexto('footer', 'columns_planosServicos_title', 'Planos')}</h3>
              <ul>
                {getTemaLinksByCategoria('footerMenuPlanos').map((link, index) => (
                  <li key={index}>
                    <a href={link.href || '#'} title={link.nome}>
                      {link.nome}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Coluna: Contato */}
            <div className={styles['footer-column']}>
              <h3>{getTexto('footer', 'columns_contato_title', 'Contato')}</h3>
              <ul>
                {getTemaLinksByCategoria('footerMenuContato').map((link, index) => (
                  <li key={index}>
                    <a href={link.href || '#'} title={link.nome}>
                      {link.nome}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Coluna: Apps */}
            {isElementEnabled('appLinks') && (
              <div className={styles['footer-column']}>
                <h3>{getTexto('footer', 'apps_title', 'Aplicativos')}</h3>
                <div className={styles['app-links']}>
                  <a
                    href={getLink('externa', 'App Store', '#')}
                    rel="noopener noreferrer"
                    aria-label="App Store"
                    className={styles['store-badge']}
                  >
                    <FontAwesomeIcon icon={faApple} className={styles['store-icon']} />
                    <div className={styles['store-text']}>
                      <span className={styles['store-label']}>
                        {getTexto('footer', 'appStore_label', 'Disponível na')}
                      </span>
                      <span className={styles['store-name']}>
                        {getTexto('footer', 'appStore_name', 'App Store')}
                      </span>
                    </div>
                  </a>
                  <a
                    href={getLink('externa', 'Google Play', '#')}
                    rel="noopener noreferrer"
                    aria-label="Google Play"
                    className={styles['store-badge']}
                  >
                    <FontAwesomeIcon icon={faGooglePlay} className={styles['store-icon']} />
                    <div className={styles['store-text']}>
                      <span className={styles['store-label']}>
                        {getTexto('footer', 'googlePlay_label', 'Disponível no')}
                      </span>
                      <span className={styles['store-name']}>
                        {getTexto('footer', 'googlePlay_name', 'Google Play')}
                      </span>
                    </div>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════════
            SEÇÃO: INFO + BOTÕES + LOCALIZAÇÃO
        ═══════════════════════════════════════════════════════════════════════════ */}
        <div className={styles['footer-info']}>
          {/* Descrição e Botões */}
          {isElementEnabled('companyInfo') && (
            <div className={styles['footer-actions']}>
              <p className={styles['footer-description']}>
                {getTexto(
                  'footer',
                  'companyInfo_description',
                  'Conectando você com qualidade e inovação.'
                )}
              </p>
              <div className={styles['footer-buttons']}>
                <a
                  href={getLink('externa', 'Central Assinante', '#')}
                  className={styles['btn']}
                  aria-label="Central do Assinante"
                >
                  {getTexto('footer', 'buttons_centralAssinante', 'Central do Assinante')}
                </a>
                <a
                  href={getLink('externa', 'Recarga Celular', '#')}
                  className={styles['btn']}
                  aria-label="Recarga de Celular"
                >
                  {getTexto('footer', 'buttons_recargaCelular', 'Recarga de Celular')}
                </a>
                <a
                  href={getLink('externa', 'Assine Agora', '#')}
                  className={styles['btn-primary']}
                  aria-label="Assine Agora"
                >
                  {getTexto('footer', 'buttons_assineAgora', 'Assine Agora')}
                </a>
              </div>
            </div>
          )}

          {/* Seletor de Localização */}
          {isElementEnabled('locationSelector') && (
            <div className={styles['footer-location']}>
              <label htmlFor="footer-state">
                {loadingLocation
                  ? getTexto('locationSelector', 'carregando', 'Detectando...')
                  : getTexto('locationSelector', 'titulo', 'Sua localização')}
              </label>
              <div className={styles['location-inputs']}>
                <select
                  id="footer-state"
                  value={selectedState}
                  onChange={handleStateChange}
                  aria-label="Estado"
                  disabled={loadingLocation}
                >
                  <option value="">
                    {getTexto('locationSelector', 'selecioneEstado', 'Estado')}
                  </option>
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                <select
                  id="footer-city"
                  value={selectedCity}
                  onChange={handleCityChange}
                  aria-label="Cidade"
                  disabled={loadingLocation || !selectedState}
                >
                  <option value="">
                    {getTexto('locationSelector', 'selecioneCidade', 'Cidade')}
                  </option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SEÇÃO: RODAPÉ (COPYRIGHT + EMPRESA + DESENVOLVEDOR)
      ═══════════════════════════════════════════════════════════════════════════ */}
      <div className={styles['footer-bottom']}>
        <div className={styles['footer-legal']}>
          {cnpj && <span>CNPJ: {cnpj}</span>}
          {licencaAnatel && <span>Licença Anatel: {licencaAnatel}</span>}
        </div>

        {isElementEnabled('copyright') && (
          <p className={styles['footer-copyright']}>
            {getTexto('footer', 'copyright', '© ONI - Todos os direitos reservados')}
          </p>
        )}

        {developerLogo && (
          <div className={styles['footer-developer']}>
            <span>Desenvolvido por</span>
            <img src={developerLogo} alt="Soft Virtus" className={styles['developer-logo']} />
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;


