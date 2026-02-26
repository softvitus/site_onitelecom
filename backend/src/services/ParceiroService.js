/**
 * Parceiro Service
 * Exemplo de serviço usando BaseService
 */

import { BaseService } from './BaseService.js';
import { ApiError, ERROR_CODES } from '../utils/ErrorCodes.js';
import { Sequelize } from 'sequelize';

export class ParceiroService extends BaseService {
  /**
   * Busca parceiro com todas as suas relações
   */
  async findByIdWithRelations(id) {
    return this.findById(id, {
      include: [
        { association: 'temas' },
        { association: 'paginas' },
      ],
    });
  }

  /**
   * Busca parceiros ativos
   */
  async findActive(pagination = {}) {
    return this.findAll({ par_status: 'ativo' }, pagination);
  }

  /**
   * Busca por cidade
   */
  async findByCity(city, pagination = {}) {
    return this.findAll({ par_cidade: city }, pagination);
  }

  /**
   * Busca por domínio
   */
  async findByDomain(domain) {
    const item = await this.model.findOne({
      where: { par_dominio: domain },
    });

    if (!item) {
      throw new ApiError('NOT_FOUND', 'Parceiro com este domínio não encontrado');
    }

    return item;
  }

  /**
   * Valida e cria novo parceiro
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
      throw new ApiError('DUPLICATE_ENTRY', 'Já existe parceiro com este domínio');
    }

    return this.create(data);
  }

  /**
   * Busca parceiros por região
   */
  async findByRegion(region, pagination = {}) {
    const cities = this.getCitiesByRegion(region);

    if (cities.length === 0) {
      throw new ApiError('INVALID_INPUT', 'Região inválida');
    }

    return this.findAll(
      { par_cidade: cities },
      pagination
    );
  }

  /**
   * Ativa/desativa parceiro
   */
  async toggleStatus(id) {
    const item = await this.findById(id);
    const newStatus = item.par_status === 'ativo' ? 'inativo' : 'ativo';

    return this.update(id, { par_status: newStatus });
  }

  /**
   * Busca parceiros próximos usando coordenadas (busca geoespacial simples)
   * Utiliza a fórmula de Haversine para calcular distância entre pontos
   */
  async findNearby(latitude, longitude, radiusKm = 50, pagination = {}) {
    // Validar coordenadas
    if (!latitude || !longitude) {
      throw new ApiError('INVALID_INPUT', 'Latitude e longitude são obrigatórias');
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new ApiError('INVALID_INPUT', 'Coordenadas fora do intervalo válido');
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
      .map(parceiro => ({
        ...parceiro.toJSON(),
        distancia: this.calculateDistance(
          latitude,
          longitude,
          parseFloat(parceiro.par_latitude),
          parseFloat(parceiro.par_longitude)
        ),
      }))
      .filter(p => p.distancia <= radiusKm)
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
   * Calcula distância entre dois pontos usando fórmula de Haversine
   * Retorna distância em km
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
   */
  validateLocationData(data) {
    if (data.par_latitude) {
      const lat = parseFloat(data.par_latitude);
      if (lat < -90 || lat > 90) {
        throw new ApiError('INVALID_INPUT', 'Latitude deve estar entre -90 e 90');
      }
    }

    if (data.par_longitude) {
      const lon = parseFloat(data.par_longitude);
      if (lon < -180 || lon > 180) {
        throw new ApiError('INVALID_INPUT', 'Longitude deve estar entre -180 e 180');
      }
    }

    if (data.par_raio_cobertura) {
      const raio = parseFloat(data.par_raio_cobertura);
      if (raio < 0) {
        throw new ApiError('INVALID_INPUT', 'Raio de cobertura não pode ser negativo');
      }
    }
  }

  getCitiesByRegion(region) {
    const regions = {
      sudeste: ['São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Espírito Santo'],
      sul: ['Rio Grande do Sul', 'Paraná', 'Santa Catarina'],
      nordeste: ['Bahia', 'Ceará', 'Pernambuco', 'Maranhão', 'Paraíba'],
      norte: ['Amazonas', 'Pará', 'Rondônia', 'Acre', 'Amapá', 'Roraima', 'Tocantins'],
      centrooeste: ['Goiás', 'Mato Grosso', 'Mato Grosso do Sul', 'Brasília'],
    };

    return regions[region.toLowerCase()] || [];
  }
}

