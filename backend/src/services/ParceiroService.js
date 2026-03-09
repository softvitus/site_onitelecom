/**
 * @module services/ParceiroService
 * @description Serviço de gerenciamento de parceiros
 */

import { BaseService } from './BaseService.js';
import { ApiError } from '../utils/ErrorCodes.js';
import { STATUS_ENUM } from '../utils/constants.js';
import { Sequelize } from 'sequelize';

/**
 * Serviço de gerenciamento de Parceiros
 * @extends BaseService
 */
export class ParceiroService extends BaseService {
  /**
   * Override findAll para converter parceiroId para par_id
   * @param {Object} filters - Filtros de busca
   * @param {Object} pagination - Opções de paginação
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Object>} Lista paginada de parceiros
   */
  async findAll(filters = {}, pagination = {}, options = {}) {
    // Converter parceiroId para par_id se presente
    if (filters.parceiroId) {
      filters.par_id = filters.parceiroId;
      delete filters.parceiroId;
    }

    return super.findAll(filters, pagination, options);
  }

  /**
   * Busca parceiro com todas as suas relações
   * @param {string} id - ID do parceiro
   * @returns {Promise<Object>} Parceiro com temas e páginas
   */
  async findByIdWithRelations(id) {
    return this.findById(id, {
      include: [{ association: 'temas' }, { association: 'paginas' }],
    });
  }

  /**
   * Busca parceiros ativos
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de parceiros ativos
   */
  async findActive(pagination = {}) {
    return this.findAll({ par_status: STATUS_ENUM.ATIVO }, pagination);
  }

  /**
   * Busca por cidade
   * @param {string} city - Nome da cidade
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de parceiros
   */
  async findByCity(city, pagination = {}) {
    return this.findAll({ par_cidade: city }, pagination);
  }

  /**
   * Busca por domínio
   * @param {string} domain - Domínio do parceiro
   * @returns {Promise<Object>} Parceiro encontrado
   * @throws {ApiError} NOT_FOUND se não existir
   */
  async findByDomain(domain) {
    const item = await this.model.findOne({
      where: { par_dominio: domain },
    });

    if (!item) {
      throw new ApiError(
        'NOT_FOUND',
        'Parceiro com este domínio não encontrado',
      );
    }

    return item;
  }

  /**
   * Valida e cria novo parceiro
   * @param {Object} data - Dados do parceiro
   * @returns {Promise<Object>} Parceiro criado
   * @throws {ApiError} DUPLICATE_ENTRY se domínio já existir
   */
  async createPayload(data) {
    // Valida campos obrigatórios
    this.validate(data, ['par_nome', 'par_dominio', 'par_cidade']);

    // Validar dados de localização se fornecidos
    this.validateLocationData(data);

    // Verifica se já existe parceiro com este domínio
    const existing = await this.model.findOne({
      where: { par_dominio: data.par_dominio },
    });

    if (existing) {
      throw new ApiError(
        'DUPLICATE_ENTRY',
        'Já existe parceiro com este domínio',
      );
    }

    return this.create(data);
  }

  /**
   * Busca parceiros por região
   * @param {string} region - Nome da região
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada de parceiros
   * @throws {ApiError} INVALID_INPUT se região inválida
   */
  async findByRegion(region, pagination = {}) {
    const cities = this.getCitiesByRegion(region);

    if (cities.length === 0) {
      throw new ApiError('INVALID_INPUT', 'Região inválida');
    }

    return this.findAll({ par_cidade: cities }, pagination);
  }

  /**
   * Ativa/desativa parceiro
   * @param {string} id - ID do parceiro
   * @returns {Promise<Object>} Parceiro atualizado
   */
  async toggleStatus(id) {
    const item = await this.findById(id);
    const newStatus = item.par_status === 'ativo' ? 'inativo' : 'ativo';

    return this.update(id, { par_status: newStatus });
  }

  /**
   * Busca parceiros próximos por coordenadas (Haversine)
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} radiusKm - Raio em km (padrão: 50)
   * @param {Object} pagination - Opções de paginação
   * @returns {Promise<Object>} Lista paginada com distância
   * @throws {ApiError} INVALID_INPUT se coordenadas inválidas
   */
  async findNearby(latitude, longitude, radiusKm = 50, pagination = {}) {
    // Validar coordenadas
    if (!latitude || !longitude) {
      throw new ApiError(
        'INVALID_INPUT',
        'Latitude e longitude são obrigatórias',
      );
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new ApiError(
        'INVALID_INPUT',
        'Coordenadas fora do intervalo válido',
      );
    }

    // Buscar todos os parceiros ativos com localização
    const parceiros = await this.model.findAll({
      where: {
        par_status: 'ativo',
        par_latitude: { [Sequelize.Op.not]: null },
        par_longitude: { [Sequelize.Op.not]: null },
      },
    });

    // Calcular distância de cada parceiro
    const nearby = parceiros
      .map((parceiro) => ({
        ...parceiro.toJSON(),
        distancia: this.calculateDistance(
          latitude,
          longitude,
          parseFloat(parceiro.par_latitude),
          parseFloat(parceiro.par_longitude),
        ),
      }))
      .filter((p) => p.distancia <= radiusKm)
      .sort((a, b) => a.distancia - b.distancia);

    // Aplicar paginação
    const limit = pagination.limit || 10;
    const page = pagination.page || 1;
    const offset = (page - 1) * limit;

    return {
      rows: nearby.slice(offset, offset + limit),
      pagination: {
        total: nearby.length,
        page,
        limit,
        pages: Math.ceil(nearby.length / limit),
      },
    };
  }

  /**
   * Calcula distância entre dois pontos (fórmula de Haversine)
   * @param {number} lat1 - Latitude ponto 1
   * @param {number} lon1 - Longitude ponto 1
   * @param {number} lat2 - Latitude ponto 2
   * @param {number} lon2 - Longitude ponto 2
   * @returns {number} Distância em km
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distância em km
  }

  /**
   * Valida dados de localização
   * @param {Object} data - Dados a validar
   * @throws {ApiError} INVALID_INPUT se dados inválidos
   */
  validateLocationData(data) {
    if (data.par_latitude) {
      const lat = parseFloat(data.par_latitude);
      if (lat < -90 || lat > 90) {
        throw new ApiError(
          'INVALID_INPUT',
          'Latitude deve estar entre -90 e 90',
        );
      }
    }

    if (data.par_longitude) {
      const lon = parseFloat(data.par_longitude);
      if (lon < -180 || lon > 180) {
        throw new ApiError(
          'INVALID_INPUT',
          'Longitude deve estar entre -180 e 180',
        );
      }
    }

    if (data.par_raio_cobertura) {
      const raio = parseFloat(data.par_raio_cobertura);
      if (raio < 0) {
        throw new ApiError(
          'INVALID_INPUT',
          'Raio de cobertura não pode ser negativo',
        );
      }
    }
  }

  /**
   * Retorna cidades por região
   * @param {string} region - Nome da região
   * @returns {string[]} Lista de cidades
   */
  getCitiesByRegion(region) {
    const regions = {
      sudeste: [
        'São Paulo',
        'Rio de Janeiro',
        'Minas Gerais',
        'Espírito Santo',
      ],
      sul: ['Rio Grande do Sul', 'Paraná', 'Santa Catarina'],
      nordeste: ['Bahia', 'Ceará', 'Pernambuco', 'Maranhão', 'Paraíba'],
      norte: [
        'Amazonas',
        'Pará',
        'Rondônia',
        'Acre',
        'Amapá',
        'Roraima',
        'Tocantins',
      ],
      centrooeste: ['Goiás', 'Mato Grosso', 'Mato Grosso do Sul', 'Brasília'],
    };

    return regions[region.toLowerCase()] || [];
  }
}

export default ParceiroService;
