/**
 * @fileoverview Componente LocationSelector - Seletor de localização do usuário
 * @component
 * @description
 * Renderiza uma interface de seleção de localização com:
 * - Detecção automática via geolocalização
 * - Seleção manual de estado e cidade
 * - Validação de cidades disponíveis
 * - Redirecionamento baseado na localização
 * - Feedback visual (loading, mensagens)
 * @returns {React.ReactElement} Formulário de seleção de localização
 */

import React, { useState, useEffect, useCallback } from 'react';
import styles from '../../estilos/componentes/comuns/LocationSelector.module.css';
import { getTexto, getImagem, getTemaTextosGrouped } from '../../servicos/tema';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🔧 EFEITOS
// ═════════════════════════════════════════════════════════════════════════════════════

/** @constant {Object} Mapeamento de cidades por estado */
const CITIES_BY_STATE = {
  pb: [
    { value: 'joao-pessoa', text: 'João Pessoa' },
    { value: 'patos', text: 'Patos' },
    { value: 'teixeira', text: 'Teixeira' },
    { value: 'coremas', text: 'Coremas' },
    { value: 'sao-mamede', text: 'São Mamede' },
    { value: 'malta', text: 'Malta' },
    { value: 'brejo-do-cruz', text: 'Brejo do Cruz' },
  ],
  pe: [{ value: 'santa-terezinha', text: 'Santa Terezinha' }],
};

/** @constant {Object[]} Lista flat de todas as cidades */
const ALL_CITIES = Object.values(CITIES_BY_STATE).flat();

/** @constant {Object} Opções de geolocalização */
const GEO_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

/** @constant {string} URL da API de geocodificação reversa */
const GEOCODE_API_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

// ═════════════════════════════════════════════════════════════════════════════════════
// 🛠️  FUNÇÕES AUXILIARES
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Obtém os textos do componente do tema
 * @returns {Object} Textos de mensagens
 */
const getLocationTexts = () => {
  const textosGroup = getTemaTextosGrouped();
  return textosGroup.locationSelector || {};
};

/**
 * Obtém o logo principal do tema
 * @returns {string} URL do logo
 */
const getLogoUrl = () => getImagem('logos', 'main', '');

/**
 * Encontra uma cidade pelo nome
 * @param {string} cityName - Nome da cidade
 * @returns {Object|undefined} Objeto cidade ou undefined
 */
const findCityByName = (cityName) =>
  ALL_CITIES.find((c) => c.text.toLowerCase() === cityName.toLowerCase());

/**
 * Encontra o estado de uma cidade
 * @param {string} cityValue - Valor da cidade
 * @returns {string|undefined} Sigla do estado ou undefined
 */
const findStateByCity = (cityValue) =>
  Object.keys(CITIES_BY_STATE).find((key) =>
    CITIES_BY_STATE[key].some((cityObj) => cityObj.value === cityValue)
  );

/**
 * Gera URL de redirecionamento baseada na cidade
 * @param {string} cityValue - Valor da cidade selecionada
 * @returns {string} URL de redirecionamento
 */
const buildRedirectUrl = (cityValue) => (cityValue === 'joao-pessoa' ? '/' : `/${cityValue}`);

// ─────────────────────────────────────────────────────────────────────────────────────

/**
 * LogoHeader - Logo no topo do card
 * @returns {React.ReactElement}
 */
const LogoHeader = () => (
  <div className={styles.logo_login}>
    <img src={getLogoUrl()} alt="Oni logo" />
  </div>
);

/**
 * Divider - Divisor visual
 * @returns {React.ReactElement}
 */
const Divider = () => <div className={styles.divider_login} role="separator" />;

/**
 * Title - Título de boas-vindas
 * @returns {React.ReactElement}
 */
const Title = () => (
  <h1 className={styles.title_login} id="location-selector-title">
    {getTexto('locationSelector', 'titulo', 'Bem-vindo! Selecione sua localização')}
  </h1>
);

/**
 * GeolocationButton - Botão para usar localização atual
 * @param {Object} props - Props do componente
 * @param {Function} props.onClick - Handler de clique
 * @returns {React.ReactElement}
 */
const GeolocationButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className={`${styles.btn_login} ${styles['btn-secondary_login']} w-100 mb-3`}
    type="button"
    aria-label="Usar geolocalização automática"
  >
    <i className="fas fa-map-marker-alt me-2" aria-hidden="true" />
    {getTexto('locationSelector', 'botaoGeolocalizacao', 'Usar minha localização atual')}
  </button>
);

/**
 * StateSelect - Select de estados
 * @param {Object} props - Props do componente
 * @param {string} props.value - Valor selecionado
 * @param {Function} props.onChange - Handler de mudança
 * @returns {React.ReactElement}
 */
const StateSelect = ({ value, onChange }) => (
  <select
    value={value}
    onChange={onChange}
    className={styles['form-select_login']}
    aria-label="Selecionar estado"
  >
    <option value="">
      {getTexto('locationSelector', 'placeholderEstado', 'Escolha um estado')}
    </option>
    <option value="pb">Paraíba - PB</option>
    <option value="pe">Pernambuco - PE</option>
  </select>
);

/**
 * CitySelect - Select de cidades
 * @param {Object} props - Props do componente
 * @param {string} props.state - Estado selecionado
 * @param {string} props.value - Cidade selecionada
 * @param {Function} props.onChange - Handler de mudança
 * @returns {React.ReactElement}
 */
const CitySelect = ({ state, value, onChange }) => (
  <select
    value={value}
    onChange={onChange}
    className={styles['form-select_login']}
    disabled={!state}
    aria-label="Selecionar cidade"
  >
    <option value="">
      {getTexto('locationSelector', 'placeholderCidade', 'Localizar cidade')}
    </option>
    {state &&
      CITIES_BY_STATE[state]?.map((city) => (
        <option key={city.value} value={city.value}>
          {city.text}
        </option>
      ))}
  </select>
);

/**
 * SubmitButton - Botão de continuar
 * @param {Object} props - Props do componente
 * @param {Function} props.onClick - Handler de clique
 * @param {boolean} props.disabled - Se está desabilitado
 * @returns {React.ReactElement}
 */
const SubmitButton = ({ onClick, disabled }) => (
  <button
    onClick={onClick}
    className={`${styles.btn_login} ${styles['btn-primary_login']} w-100`}
    disabled={disabled}
    type="button"
    aria-label="Continuar para o site"
  >
    <i className="fas fa-arrow-right me-2" aria-hidden="true" />
    {getTexto('locationSelector', 'botaoContinuar', 'Continuar')}
  </button>
);

/**
 * LoadingIndicator - Indicador de carregamento
 * @returns {React.ReactElement}
 */
const LoadingIndicator = () => (
  <div className={`${styles['loading-indicator_login']} mt-3`} role="status" aria-live="polite">
    <i className="fas fa-circle-notch fa-spin fa-2x" aria-hidden="true" />
    <p className="mt-2">{getTexto('locationSelector', 'carregando', 'Carregando...')}</p>
  </div>
);

/**
 * MessageAlert - Alerta de mensagem
 * @param {Object} props - Props do componente
 * @param {string} props.message - Mensagem a exibir
 * @returns {React.ReactElement}
 */
const MessageAlert = ({ message }) => (
  <div className={`${styles['alert-info_login']} mt-3`} role="alert" aria-live="polite">
    {message}
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════════════
// 📱 COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════════════

/**
 * Componente LocationSelector - Seletor de localização do usuário
 * @returns {React.ReactElement}
 */
const LocationSelector = () => {
  // ─────────────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────────────

  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // ─────────────────────────────────────────────────────────────────────────────────
  // DATA
  // ─────────────────────────────────────────────────────────────────────────────────

  const texts = getLocationTexts();

  // ─────────────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────────

  /**
   * Processa dados de localização da API
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   */
  const getLocationData = useCallback(
    (latitude, longitude) => {
      const url = `${GEOCODE_API_URL}?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`;

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          const cityName = data.city;
          const matchedCity = findCityByName(cityName);

          if (matchedCity) {
            const stateOption = findStateByCity(matchedCity.value);
            if (stateOption) {
              setState(stateOption);
              setCity(matchedCity.value);
            }
            setMessage('');
          } else {
            setMessage(texts.cidadeIndisponivel || 'Cidade não disponível');
          }

          setLoading(false);
        })
        .catch((error) => {
          // eslint-disable-next-line no-console

          // eslint-disable-next-line no-console
          console.error('Error fetching location data:', error);
          setLoading(false);
          setMessage(texts.erroGeo || 'Erro ao obter localização');
        });
    },
    [texts]
  );

  /**
   * Obtém localização do usuário via geolocalização
   */
  const handleGetUserLocation = () => {
    if (!('geolocation' in navigator)) {
      setMessage(texts.geoNaoSuportado || 'Geolocalização não suportada');
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => getLocationData(position.coords.latitude, position.coords.longitude),
      (error) => {
        // eslint-disable-next-line no-console

        // eslint-disable-next-line no-console
        console.error('Error getting user location:', error);
        setLoading(false);
        setMessage(texts.erroGeo || 'Erro ao obter localização');
      },
      GEO_OPTIONS
    );
  };

  /**
   * Atualiza estado e reseta cidade
   * @param {Event} e - Evento de mudança
   */
  const handleStateChange = (e) => {
    setState(e.target.value);
    setCity('');
  };

  /**
   * Atualiza cidade selecionada
   * @param {Event} e - Evento de mudança
   */
  const handleCityChange = (e) => {
    setCity(e.target.value);
  };

  /**
   * Submete formulário e redireciona
   */
  const handleSubmit = () => {
    if (!city) return;

    setLoading(true);
    setTimeout(() => {
      window.location.href = buildRedirectUrl(city);
    }, 1000);
  };

  // ─────────────────────────────────────────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────────────────────────────────────────

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Verifica permissão de geolocalização na montagem
    if ('geolocation' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          // Chama a função de geolocalização aqui
          if (!('geolocation' in navigator)) {
            return;
          }

          setLoading(true);

          navigator.geolocation.getCurrentPosition(
            (position) => getLocationData(position.coords.latitude, position.coords.longitude),
            (error) => {
              // eslint-disable-next-line no-console

              // eslint-disable-next-line no-console
              console.error('Error getting user location:', error);
              setLoading(false);
              setMessage(texts.erroGeo || 'Erro ao obter localização');
            },
            GEO_OPTIONS
          );
        }
      });
    }
  }, [getLocationData, texts.erroGeo]); // Inclui dependências necessárias

  // ─────────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────────

  return (
    <div
      className={`${styles.login_container} ${styles.container_login}`}
      role="main"
      aria-labelledby="location-selector-title"
    >
      <div className={styles['inner-container_login']}>
        <div className={styles.card_login}>
          <div className={styles['card-body_login']}>
            {/* Logo */}
            <LogoHeader />

            {/* Divisor */}
            <Divider />

            {/* Título */}
            <Title />

            {/* Botão Geolocalização */}
            <GeolocationButton onClick={handleGetUserLocation} />

            {/* Select Estado */}
            <StateSelect value={state} onChange={handleStateChange} />

            {/* Select Cidade */}
            <CitySelect state={state} value={city} onChange={handleCityChange} />

            {/* Botão Continuar */}
            <SubmitButton onClick={handleSubmit} disabled={!state || !city} />

            {/* Loading */}
            {loading && <LoadingIndicator />}

            {/* Mensagem */}
            {message && <MessageAlert message={message} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;
