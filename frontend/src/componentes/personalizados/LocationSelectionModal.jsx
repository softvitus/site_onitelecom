/**
 * ============================================================================
 * LocationSelectionModal - Modal de Seleção de Localização
 * ============================================================================
 *
 * Modal que aparece ao acessar o site para solicitar a localização do usuário.
 * Personalizado dinamicamente de acordo com o parceiro/domínio detectado.
 *
 * Funcionalidades:
 * - Detecção automática de geolocalização (com permissão)
 * - Listagem de todas as cidades com parceiros disponíveis
 * - Tema dinâmico carregado via API (cores, logo, textos)
 * - Redirecionamento automático para domínio do parceiro
 * - Armazenamento de preferências no localStorage
 *
 * @module componentes/personalizados/LocationSelectionModal
 * @requires react
 * @requires react-router-dom
 * @requires react-icons/md
 *
 * @example
 * // Uso básico (geralmente no App.jsx)
 * import LocationSelectionModal from './componentes/personalizados/LocationSelectionModal';
 *
 * function App() {
 *   const [showModal, setShowModal] = useState(true);
 *   return showModal && <LocationSelectionModal />;
 * }
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
// PropTypes import removido conforme não utilizado

// ----------------------------------------------------------------------------
// Ícones
// ----------------------------------------------------------------------------
import { MdWarning } from 'react-icons/md';

// ----------------------------------------------------------------------------
// Serviços e Utilitários
// ----------------------------------------------------------------------------
import { detectTenant, buscarOuCachearTemaParceiro } from '../../servicos/tema';
import { get } from '../../servicos/api';
import { buscarTodosParceiros } from '../../servicos/parceiro';

// ----------------------------------------------------------------------------
// Componentes Internos
// ----------------------------------------------------------------------------
import ImageWithSkeleton from './ImageWithSkeleton';

// ----------------------------------------------------------------------------
// Estilos
// ----------------------------------------------------------------------------
import styles from '../../estilos/componentes/personalizados/LocationSelectionModal.module.css';

// ============================================================================
// CONSTANTES
// ============================================================================

/** Cores padrão do tema (fallback) */
const DEFAULT_COLORS = Object.freeze({
  primary: '#8a1ce5',
  primaryDark: '#4a00e0',
  secondary: '#821CE5',
  background: '#f5f7fa',
  text: '#333',
});

/** Textos padrão do componente (fallback) */
const DEFAULT_TEXTS = Object.freeze({
  selectLocation: 'Sua Cidade:',
  confirmButton: 'Confirmar',
  loadingCities: 'Carregando cidades...',
  detectingLocation: 'Detectando sua localização...',
  selectCity: '-- Selecione uma cidade --',
  processing: 'Processando...',
  errorInvalidLocation: 'Selecione uma localidade válida com parceiro disponível',
  errorPartnerNotFound: 'Parceiro não encontrado',
});

/** Chaves do localStorage */
const STORAGE_KEYS = Object.freeze({
  currentParceiro: 'currentParceiro',
  selectedLocation: 'selectedLocation',
});

/** Delay para garantir armazenamento antes do redirect (ms) */
const STORAGE_DELAY_MS = 300;

// ============================================================================
// UTILITÁRIOS - EXTRAÇÃO DE TEMA
// ============================================================================

/**
 * Extrai cores do array de cores da API
 * @param {Array} coresArray - Array de cores da API
 * @returns {Object} Objeto com cores formatadas
 */
const extrairCoresDoTema = (coresArray) => {
  const cores = { ...DEFAULT_COLORS };

  if (!Array.isArray(coresArray) || coresArray.length === 0) {
    return cores;
  }

  // Estrutura API: { categoria, nome, valor }
  // Categorias em PORTUGUÊS: 'primaria', 'secundaria', 'neutro', 'status'
  const primarias = coresArray.filter((c) => c.categoria === 'primaria');
  const secundarias = coresArray.filter((c) => c.categoria === 'secundaria');
  const neutras = coresArray.filter((c) => c.categoria === 'neutro');

  // Cor primária principal (Roxo Principal)
  const corPrincipal = primarias.find((c) => c.nome?.toLowerCase().includes('principal'));
  if (corPrincipal) {
    cores.primary = corPrincipal.valor;
  }

  // Cor primária dark (Roxo Escuro)
  const corEscura = primarias.find(
    (c) =>
      c.nome?.toLowerCase().includes('escuro') && !c.nome?.toLowerCase().includes('alternativo')
  );
  if (corEscura) {
    cores.primaryDark = corEscura.valor;
  }

  // Cor secundária (Info ou Principal)
  const corSecundaria = secundarias.find(
    (c) => c.nome?.toLowerCase().includes('info') || c.nome?.toLowerCase().includes('principal')
  );
  if (corSecundaria) {
    cores.secondary = corSecundaria.valor;
  }

  // Background (Fundo Claro)
  const bgColor = neutras.find((c) => c.nome?.toLowerCase().includes('fundo claro'));
  if (bgColor) {
    cores.background = bgColor.valor;
  }

  // Texto (Texto Padrão)
  const textColor = neutras.find((c) => c.nome?.toLowerCase().includes('texto padrão'));
  if (textColor) {
    cores.text = textColor.valor;
  }

  return cores;
};

/**
 * Extrai textos do array de textos da API
 * @param {Array} textosArray - Array de textos da API
 * @returns {Object} Objeto com textos formatados
 */
const extrairTextosDoTema = (textosArray) => {
  const textos = { ...DEFAULT_TEXTS };

  if (!Array.isArray(textosArray) || textosArray.length === 0) {
    return textos;
  }

  // Estrutura API: { categoria, chave, valor }
  const locationTexto = textosArray.find((t) => t.categoria === 'locationSelector');
  if (locationTexto?.valor) {
    textos.selectLocation = locationTexto.valor;
  }

  // Tentar encontrar texto do botão
  const botaoTexto = textosArray.find(
    (t) => t.categoria === 'locationSelector' && t.chave === 'confirmButton'
  );
  if (botaoTexto?.valor) {
    textos.confirmButton = botaoTexto.valor;
  }

  return textos;
};

/**
 * Extrai logo do array de imagens da API
 * Prioridade: Main > Header > qualquer logo
 * @param {Array} imagensArray - Array de imagens da API
 * @returns {string|null} URL/base64 da logo ou null
 */
const extrairLogoDoTema = (imagensArray) => {
  if (!Array.isArray(imagensArray) || imagensArray.length === 0) {
    return null;
  }

  // Filtrar apenas logos (categoria 'logos' - com S)
  const todasLogos = imagensArray.filter((img) => img.categoria === 'logos');

  // Prioridade 1: Logo "Main"
  const logoMain = imagensArray.find(
    (img) => img.categoria === 'logos' && img.nome?.toLowerCase() === 'main'
  );

  if (logoMain) {
    return logoMain.valor;
  }

  // Prioridade 2: Logo "Header"
  const logoHeader = imagensArray.find(
    (img) => img.categoria === 'logos' && img.nome?.toLowerCase() === 'header'
  );

  if (logoHeader) {
    return logoHeader.valor;
  }

  // Prioridade 3: Qualquer logo disponível
  const logoFallback = imagensArray.find((img) => img.categoria === 'logos');

  if (logoFallback) {
    return logoFallback.valor;
  }

  return null;
};

/**
 * Aplica cores do tema ao DOM via CSS Variables
 * @param {Object} cores - Objeto com cores do tema
 */
const aplicarTemaCSS = (cores) => {
  const root = document.documentElement;

  const cssVars = {
    '--color-primary': cores.primary,
    '--color-primary-dark': cores.primaryDark,
    '--color-secondary': cores.secondary,
    '--color-background': cores.background,
    '--color-text': cores.text,
  };

  Object.entries(cssVars).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
};

// ============================================================================
// UTILITÁRIOS - PROCESSAMENTO DE DADOS
// ============================================================================

/**
 * Processa lista de parceiros e extrai cidades únicas
 * @param {Array} parceiros - Lista de parceiros da API
 * @returns {{ cidades: Array, parceiroMap: Map }} Cidades ordenadas e mapa de parceiros
 */
const processarParceiros = (parceiros) => {
  const cidadesMap = new Map();
  const parceiroMap = new Map();

  parceiros.forEach((parceiro) => {
    if (!parceiro.cidade || !parceiro.estado) return;

    const chave = `${parceiro.cidade}-${parceiro.estado}`;

    if (!cidadesMap.has(chave)) {
      cidadesMap.set(chave, {
        cidade: parceiro.cidade,
        estado: parceiro.estado,
        label: `${parceiro.cidade}, ${parceiro.estado}`,
      });
      parceiroMap.set(chave, parceiro);
    }
  });

  const cidades = Array.from(cidadesMap.values()).sort((a, b) =>
    a.cidade.localeCompare(b.cidade, 'pt-BR')
  );

  return { cidades, parceiroMap };
};

/**
 * Encontra o parceiro mais próximo dentro do raio de cobertura
 * @param {Array} parceiros - Lista de parceiros com distância
 * @returns {Object|null} Parceiro mais próximo ou null
 */
const encontrarParceiroMaisProximo = (parceiros) => {
  let parceiroMaisProximo = null;
  let menorDistancia = Infinity;

  parceiros.forEach((parceiro) => {
    const dentroDoRaio = parceiro.distancia <= parceiro.raioCobertura;
    const maisProximo = parceiro.distancia < menorDistancia;

    if (dentroDoRaio && maisProximo) {
      menorDistancia = parceiro.distancia;
      parceiroMaisProximo = parceiro;
    }
  });

  return parceiroMaisProximo;
};

// ============================================================================
// UTILITÁRIOS - STORAGE
// ============================================================================

/**
 * Salva dados do parceiro selecionado no localStorage
 * @param {Object} parceiro - Dados do parceiro
 * @param {Object} cidade - Dados da cidade selecionada
 */
const salvarSelecaoNoStorage = (parceiro, cidade) => {
  localStorage.setItem(
    STORAGE_KEYS.currentParceiro,
    JSON.stringify({
      id: parceiro.id,
      nome: parceiro.nome,
      dominio: parceiro.dominio,
      cidade: parceiro.cidade,
      estado: parceiro.estado,
    })
  );

  localStorage.setItem(
    STORAGE_KEYS.selectedLocation,
    JSON.stringify({
      city: cidade.cidade,
      state: cidade.estado,
      label: cidade.label,
      timestamp: Date.now(),
    })
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Modal de seleção de localização
 * @component
 */
const LocationSelectionModal = () => {
  // --------------------------------------------------------------------------
  // Estado
  // --------------------------------------------------------------------------

  /** Configuração do tema (cores, textos, logo) */
  const [config, setConfig] = useState(null);

  /** Lista de cidades com parceiros disponíveis */
  const [cidadesComParceiros, setCidadesComParceiros] = useState([]);

  /** Mapa cidade -> parceiro para lookup rápido */
  const [parceirosPorCidade, setParceirosPorCidade] = useState(new Map());

  /** Label da cidade selecionada */
  const [selectedLocationId, setSelectedLocationId] = useState('');

  /** Estados de loading */
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(true);
  const [carregandoCidades, setCarregandoCidades] = useState(false);

  /** Mensagem de erro */
  const [error, setError] = useState('');

  // --------------------------------------------------------------------------
  // Valores Derivados (Memoizados)
  // --------------------------------------------------------------------------

  /** CSS Variables para o modal - usa variáveis aplicadas por applyTemaCoresCSS */
  const modalStyles = useMemo(
    () => ({
      '--modal-primary': 'var(--color-primaria-roxo-principal, #8a1ce5)',
      '--modal-primary-dark': 'var(--color-primaria-roxo-escuro, #4a00e0)',
      '--modal-text': 'var(--color-neutro-texto-padro, #333)',
    }),
    []
  );

  /** Textos do componente (tema ou padrão) */
  const textos = useMemo(
    () => ({
      selectLocation: config?.texts?.selectLocation || DEFAULT_TEXTS.selectLocation,
      confirmButton: config?.texts?.confirmButton || DEFAULT_TEXTS.confirmButton,
    }),
    [config?.texts]
  );

  /** Placeholder do select baseado no estado atual */
  const selectPlaceholder = useMemo(() => {
    if (carregandoCidades) return DEFAULT_TEXTS.loadingCities;
    if (geoLoading) return DEFAULT_TEXTS.detectingLocation;
    return DEFAULT_TEXTS.selectCity;
  }, [carregandoCidades, geoLoading]);

  /** Botão está desabilitado? */
  const isButtonDisabled = useMemo(
    () => loading || !selectedLocationId || carregandoCidades,
    [loading, selectedLocationId, carregandoCidades]
  );

  // --------------------------------------------------------------------------
  // Callbacks
  // --------------------------------------------------------------------------

  /**
   * Carrega configuração do parceiro (tema) via API
   */
  const carregarConfiguracaoParceiro = useCallback(async () => {
    try {
      const parceiroId = await detectTenant();

      if (!parceiroId) {
        return;
      }

      const response = await buscarOuCachearTemaParceiro(parceiroId);

      if (!response.success || !response.data) {
        return;
      }

      const temaDados = response.data;

      const configFormatado = {
        partnerName: temaDados.nome || parceiroId,
        colors: extrairCoresDoTema(temaDados.cores || []),
        texts: extrairTextosDoTema(temaDados.textos || []),
        logo: extrairLogoDoTema(temaDados.imagens || []),
      };

      setConfig(configFormatado);
      aplicarTemaCSS(configFormatado.colors);
    } catch (erro) {
      setConfig(null);
    }
  }, []);

  /**
   * Carrega todos os parceiros e suas cidades
   */
  const carregarTodosParceiros = useCallback(async () => {
    try {
      setCarregandoCidades(true);

      const response = await buscarTodosParceiros();

      if (!response.success || !Array.isArray(response.data)) {
        return;
      }

      const { cidades, parceiroMap } = processarParceiros(response.data);

      setCidadesComParceiros(cidades);
      setParceirosPorCidade(parceiroMap);

      // Selecionar primeira cidade por padrão se nenhuma selecionada
      if (cidades.length > 0) {
        setSelectedLocationId((prev) => prev || cidades[0].label);
      }
    } catch (erro) {
      // Erro silencioso
    } finally {
      setCarregandoCidades(false);
    }
  }, []);

  /**
   * Tenta detectar localização via geolocalização do navegador
   */
  const detectarGeolocalizacao = useCallback(async () => {
    if (!navigator.geolocation || cidadesComParceiros.length === 0) {
      setGeoLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await get(`/public/parceiros/proximos/${latitude}/${longitude}`);

          if (!response.success || !Array.isArray(response.data)) {
            setGeoLoading(false);
            return;
          }

          const parceiroProximo = encontrarParceiroMaisProximo(response.data);

          if (parceiroProximo) {
            const cidadeSelecionada = `${parceiroProximo.cidade}, ${parceiroProximo.estado}`;
            setSelectedLocationId(cidadeSelecionada);
            setError('');
          }
        } catch (erro) {
          // Erro silencioso - usa seleção manual
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        // Usuário negou permissão - usar seleção manual
        setGeoLoading(false);
      }
    );
  }, [cidadesComParceiros]);

  /**
   * Handler de mudança do select
   */
  const handleLocationChange = useCallback((event) => {
    setSelectedLocationId(event.target.value);
    setError('');
  }, []);

  /**
   * Handler de confirmação - redireciona para domínio do parceiro
   */
  const handleConfirm = useCallback(async () => {
    const cidadeSelecionada = cidadesComParceiros.find((c) => c.label === selectedLocationId);

    if (!cidadeSelecionada) {
      setError(DEFAULT_TEXTS.errorInvalidLocation);
      return;
    }

    setLoading(true);

    try {
      const chave = `${cidadeSelecionada.cidade}-${cidadeSelecionada.estado}`;
      const parceiro = parceirosPorCidade.get(chave);

      if (!parceiro?.dominio) {
        setError(DEFAULT_TEXTS.errorPartnerNotFound);
        setLoading(false);
        return;
      }

      // Salvar seleção no localStorage
      salvarSelecaoNoStorage(parceiro, cidadeSelecionada);

      // Aguardar para garantir armazenamento
      await new Promise((resolve) => setTimeout(resolve, STORAGE_DELAY_MS));

      // Redirecionar para domínio do parceiro
      window.location.href = parceiro.dominio;
    } catch (err) {
      setError(`Erro: ${err.message}`);
      setLoading(false);
    }
  }, [cidadesComParceiros, selectedLocationId, parceirosPorCidade]);

  // --------------------------------------------------------------------------
  // Efeitos
  // --------------------------------------------------------------------------

  // Carrega configuração do parceiro ao montar
  useEffect(() => {
    carregarConfiguracaoParceiro();
  }, [carregarConfiguracaoParceiro]);

  // Carrega todos os parceiros ao montar
  useEffect(() => {
    carregarTodosParceiros();
  }, [carregarTodosParceiros]);

  // Tenta detectar geolocalização após carregar cidades
  useEffect(() => {
    detectarGeolocalizacao();
  }, [detectarGeolocalizacao]);

  // --------------------------------------------------------------------------
  // Renderização
  // --------------------------------------------------------------------------

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal} style={modalStyles}>
        {/* ================================================================ */}
        {/* LOGO DO PARCEIRO                                                */}
        {/* ================================================================ */}
        {config?.logo && (
          <div className={styles.logoContainer}>
            <ImageWithSkeleton
              src={config.logo}
              alt={config.partnerName}
              className={styles.logo}
              containerClassName={styles.logoImageContainer}
            />
          </div>
        )}

        {/* ================================================================ */}
        {/* CONTEÚDO PRINCIPAL                                              */}
        {/* ================================================================ */}
        <div className={styles.content}>
          {/* Mensagem de Erro */}
          {error && (
            <div className={styles.errorMessage}>
              <MdWarning style={{ marginRight: '8px' }} />
              <p>{error}</p>
            </div>
          )}

          {/* Seletor de Cidade */}
          <div className={styles.selectContainer}>
            <label htmlFor="locationSelect" className={styles.label}>
              {textos.selectLocation}
            </label>
            <select
              id="locationSelect"
              className={styles.select}
              value={selectedLocationId}
              onChange={handleLocationChange}
              disabled={loading || carregandoCidades}
              style={{ borderColor: 'var(--modal-primary)' }}
            >
              <option value="">{selectPlaceholder}</option>
              {!carregandoCidades &&
                cidadesComParceiros.map((cidade, index) => (
                  <option key={`${cidade.label}-${index}`} value={cidade.label}>
                    {cidade.label}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* ================================================================ */}
        {/* FOOTER - BOTÃO DE CONFIRMAÇÃO                                   */}
        {/* ================================================================ */}
        <div className={styles.footer}>
          <button
            className={styles.confirmButton}
            onClick={handleConfirm}
            disabled={isButtonDisabled}
            style={{ backgroundColor: 'var(--modal-primary)' }}
          >
            {loading ? DEFAULT_TEXTS.processing : textos.confirmButton}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PROP TYPES
// ============================================================================

LocationSelectionModal.propTypes = {
  // Componente não possui props externas - configuração via API
};

// ============================================================================
// EXPORTS
// ============================================================================

export default LocationSelectionModal;

/**
 * Utilitários exportados para testes ou uso externo
 */
export {
  extrairCoresDoTema,
  extrairTextosDoTema,
  extrairLogoDoTema,
  processarParceiros,
  encontrarParceiroMaisProximo,
  DEFAULT_COLORS,
  DEFAULT_TEXTS,
};
