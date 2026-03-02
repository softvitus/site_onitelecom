/**
 * @file Serviço de Integração com ViaCEP e Nominatim
 * @description Fornece utilitários para busca de endereços por CEP e geocodificação
 * de localizações utilizando APIs públicas (ViaCEP e OpenStreetMap/Nominatim)
 * 
 * @module servicos/viacep
 */

// ============================================================================
// CONSTANTES
// ============================================================================

const VIACEP_BASE_URL = 'https://viacep.com.br/ws';
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_RATE_LIMIT_DELAY = 200; // ms entre requisições
const CEP_LENGTH = 8;
const LATITUDE_MIN = -90;
const LATITUDE_MAX = 90;
const LONGITUDE_MIN = -180;
const LONGITUDE_MAX = 180;

/**
 * Mapeamento de siglas de estados para nomes completos em português
 * @type {Object<string, string>}
 */
const ESTADOS_BRASIL = {
  'AC': 'acre',
  'AL': 'alagoas',
  'AP': 'amapá',
  'AM': 'amazonas',
  'BA': 'bahia',
  'CE': 'ceará',
  'DF': 'distrito federal',
  'ES': 'espírito santo',
  'GO': 'goiás',
  'MA': 'maranhão',
  'MT': 'mato grosso',
  'MS': 'mato grosso do sul',
  'MG': 'minas gerais',
  'PA': 'pará',
  'PB': 'paraíba',
  'PR': 'paraná',
  'PE': 'pernambuco',
  'PI': 'piauí',
  'RJ': 'rio de janeiro',
  'RN': 'rio grande do norte',
  'RS': 'rio grande do sul',
  'RO': 'rondônia',
  'RR': 'roraima',
  'SC': 'santa catarina',
  'SP': 'são paulo',
  'SE': 'sergipe',
  'TO': 'tocantins',
};

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Valida se uma latitude está dentro dos limites válidos
 * @param {number} latitude - Valor de latitude a validar
 * @returns {boolean} True se a latitude é válida
 */
const isLatitudeValida = (latitude) => {
  const lat = parseFloat(latitude);
  return !isNaN(lat) && lat >= LATITUDE_MIN && lat <= LATITUDE_MAX;
};

/**
 * Valida se uma longitude está dentro dos limites válidos
 * @param {number} longitude - Valor de longitude a validar
 * @returns {boolean} True se a longitude é válida
 */
const isLongitudeValida = (longitude) => {
  const lng = parseFloat(longitude);
  return !isNaN(lng) && lng >= LONGITUDE_MIN && lng <= LONGITUDE_MAX;
};

/**
 * Valida se um par de coordenadas é válido
 * @param {number} latitude - Latitude a validar
 * @param {number} longitude - Longitude a validar
 * @returns {boolean} True se ambas as coordenadas são válidas
 */
const sãoCoordenadosValidas = (latitude, longitude) => {
  return isLatitudeValida(latitude) && isLongitudeValida(longitude);
};

/**
 * Normaliza e valida um CEP
 * @param {string} cep - CEP com ou sem formatação
 * @returns {Object} {valido: boolean, cep: string, erro: string}
 */
const validarEFormatarCEP = (cep) => {
  const cepLimpo = cep.replace(/\D/g, '');
  
  if (!cepLimpo || cepLimpo.length !== CEP_LENGTH) {
    return {
      valido: false,
      cep: '',
      erro: 'CEP inválido. Use o formato: 12345-678',
    };
  }

  return {
    valido: true,
    cep: cepLimpo,
    erro: null,
  };
};

/**
 * Formata um CEP limpo para o formato visual
 * @param {string} cepLimpo - CEP com 8 dígitos
 * @returns {string} CEP formatado como "12345-678"
 */
const formatarCEP = (cepLimpo) => {
  return `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`;
};

/**
 * Cria as queries de busca em ordem de especificidade
 * @param {Object} dados - Dados do endereço {endereco, bairro, cidade, estado}
 * @returns {string[]} Array de queries em ordem de prioridade
 */
const gerarQueries = ({ endereco, bairro, cidade, estado }) => {
  const queries = [];

  // 1. Endereço + bairro + cidade + estado (máxima especificidade)
  if (endereco && bairro) {
    queries.push(`${endereco}, ${bairro}, ${cidade}, ${estado}, Brasil`);
  }

  // 2. Endereço + cidade + estado
  if (endereco) {
    queries.push(`${endereco}, ${cidade}, ${estado}, Brasil`);
  }

  // 3. Bairro + cidade + estado
  if (bairro) {
    queries.push(`${bairro}, ${cidade}, ${estado}, Brasil`);
  }

  // 4. Apenas cidade + estado (fallback priorizado)
  queries.push(`${cidade}, ${estado}, Brasil`);
  queries.push(`${cidade}, ${estado}`);

  // Remover duplicatas mantendo ordem
  return [...new Set(queries)];
};

/**
 * Valida se uma resposta do Nominatim contém cidade e estado corretos
 * @param {string} displayName - Nome formatado da localidade
 * @param {string} cidade - Cidade esperada
 * @param {string} estado - Estado esperado (sigla ou nome)
 * @returns {boolean} True se contém cidade e estado
 */
const validarRespotaNominatim = (displayName, cidade, estado) => {
  const displayLower = displayName?.toLowerCase() || '';
  const cidadeLower = cidade.toLowerCase();
  const nomeEstado = ESTADOS_BRASIL[estado.toUpperCase()] || estado.toLowerCase();

  const contemCidade = displayLower.includes(cidadeLower);
  const contemEstado = 
    displayLower.includes(nomeEstado) || 
    displayLower.includes(estado.toLowerCase());

  return contemCidade && contemEstado;
};

/**
 * Aguarda um tempo específico (para respeitar rate limits)
 * @param {number} ms - Milissegundos a aguardar
 * @returns {Promise<void>}
 */
const aguardar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Realiza uma requisição com tratamento de erros
 * @param {string} url - URL da requisição
 * @param {Object} options - Opções do fetch
 * @returns {Promise<any>} Dados da resposta JSON ou null
 */
const buscarDaAPI = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SiteOni-Frontend/1.0',
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (erro) {
    console.error(`[ERRO] Falha ao buscar ${url}:`, erro.message);
    return null;
  }
};

// ============================================================================
// SERVIÇO PRINCIPAL
// ============================================================================

/**
 * Serviço de Localização e Endereço
 * Integra ViaCEP para busca por CEP e Nominatim para geocodificação
 */
const ViaCepService = {
  /**
   * Busca informações de endereço pelo CEP
   * 
   * @async
   * @param {string} cep - CEP no formato "12345-678" ou "12345678"
   * @returns {Promise<Object>} Objeto com {sucesso, dados?, erro?}
   * 
   * @example
   * const resultado = await ViaCepService.buscarPorCep('12345-678');
   * if (resultado.sucesso) {
   *   console.log(resultado.dados.cidade); // São Paulo
   * }
   */
  buscarPorCep: async (cep) => {
    try {
      // Validar e formatar CEP
      const validacao = validarEFormatarCEP(cep);
      if (!validacao.valido) {
        return {
          sucesso: false,
          erro: validacao.erro,
        };
      }

      // Buscar na API ViaCEP
      const dados = await buscarDaAPI(`${VIACEP_BASE_URL}/${validacao.cep}/json/`);

      if (!dados) {
        return {
          sucesso: false,
          erro: 'Erro ao conectar com ViaCEP',
        };
      }

      if (dados.erro) {
        return {
          sucesso: false,
          erro: 'CEP não encontrado',
        };
      }

      // Retornar dados formatados
      return {
        sucesso: true,
        dados: {
          cep: formatarCEP(validacao.cep),
          endereco: dados.logradouro || '',
          bairro: dados.bairro || '',
          cidade: dados.localidade || '',
          estado: dados.uf || '',
          ibge: dados.ibge || '',
        },
      };
    } catch (erro) {
      console.error('[ERRO] Exceção ao buscar CEP:', erro);
      return {
        sucesso: false,
        erro: 'Erro ao buscar CEP',
      };
    }
  },

  /**
   * Busca coordenadas (latitude/longitude) usando Nominatim
   * 
   * Utiliza estratégia progressiva de buscas, começando com endereço
   * completo e caindo para buscas menos específicas se necessário.
   * 
   * @async
   * @param {Object} enderecoDados - Dados do endereço
   * @param {string} enderecoDados.endereco - Rua/avenida
   * @param {string} enderecoDados.bairro - Bairro
   * @param {string} enderecoDados.cidade - Cidade
   * @param {string} enderecoDados.estado - Estado (sigla ou nome)
   * @returns {Promise<Object>} Objeto com {latitude: string, longitude: string}
   * 
   * @example
   * const coords = await ViaCepService.buscarCoordenadas({
   *   endereco: 'Rua A, 123',
   *   bairro: 'Centro',
   *   cidade: 'São Paulo',
   *   estado: 'SP'
   * });
   * console.log(coords); // {latitude: '-23.5505', longitude: '-46.6333'}
   */
  buscarCoordenadas: async (enderecoDados) => {
    try {
      // Validar entrada
      if (!enderecoDados || typeof enderecoDados !== 'object') {
        return { latitude: '', longitude: '' };
      }

      const { endereco, bairro, cidade, estado } = enderecoDados;

      if (!cidade || !estado) {
        return { latitude: '', longitude: '' };
      }

      // Normalizar dados
      const cidadeNorm = cidade.trim();
      const estadoNorm = estado.trim().toUpperCase();
      const enderecoNorm = endereco?.trim() || '';
      const bairroNorm = bairro?.trim() || '';

      // Gerar queries em ordem de especificidade
      const queries = gerarQueries({
        endereco: enderecoNorm,
        bairro: bairroNorm,
        cidade: cidadeNorm,
        estado: estadoNorm,
      });

      // Tentar buscar com queries especializadas
      for (let i = 0; i < queries.length; i++) {
        const query = queries[i];
        await aguardar(NOMINATIM_RATE_LIMIT_DELAY);

        const dadosNominatim = await buscarDaAPI(
          `${NOMINATIM_BASE_URL}?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`
        );

        if (!Array.isArray(dadosNominatim) || dadosNominatim.length === 0) {
          continue;
        }

        // Procurar resultado mais específico (que contenha cidade E estado)
        for (const resultado of dadosNominatim) {
          const lat = parseFloat(resultado.lat);
          const lon = parseFloat(resultado.lon);

          // Validar coordenadas
          if (!sãoCoordenadosValidas(lat, lon)) {
            continue;
          }

          // Validar se é a região correta
          if (validarRespotaNominatim(resultado.display_name, cidadeNorm, estadoNorm)) {
            return {
              latitude: lat.toString(),
              longitude: lon.toString(),
            };
          }
        }
      }

      // FALLBACK: Se nenhuma correspondência exata, pega primeiro resultado válido
      for (let i = 0; i < queries.length; i++) {
        const query = queries[i];
        await aguardar(NOMINATIM_RATE_LIMIT_DELAY);

        const dadosNominatim = await buscarDaAPI(
          `${NOMINATIM_BASE_URL}?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`
        );

        if (!Array.isArray(dadosNominatim) || dadosNominatim.length === 0) {
          continue;
        }

        const resultado = dadosNominatim[0];
        const lat = parseFloat(resultado.lat);
        const lon = parseFloat(resultado.lon);

        if (sãoCoordenadosValidas(lat, lon)) {
          return {
            latitude: lat.toString(),
            longitude: lon.toString(),
          };
        }
      }

      return { latitude: '', longitude: '' };
    } catch (erro) {
      console.error('[ERRO] Exceção ao buscar coordenadas:', erro);
      return { latitude: '', longitude: '' };
    }
  },
};

export default ViaCepService;
