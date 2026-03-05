import { ParceiroService } from '../../services/ParceiroService.js';
import { Sequelize } from 'sequelize';

const fakeParceiroModel = {
  name: 'Parceiro',
  sequelize: {
    Op: Sequelize.Op,
  },
  findAll: async () => [{ par_id: '1', par_nome: 'Telecom Plus', par_dominio: 'telecomplus.com' }],
  findOne: async ({ where }) => {
    // Suportar busca por domínio ou nome
    if (where.par_dominio === 'telecomplus.com') {
      return { 
        par_id: '1', 
        par_nome: 'Telecom Plus', 
        par_dominio: 'telecomplus.com',
        destroy: async () => {
          return 1; 
        },
      };
    }
    if (where.par_nome === 'Telecom Plus') {
      return { 
        par_id: '1', 
        par_nome: 'Telecom Plus', 
        par_dominio: 'telecomplus.com',
        destroy: async () => {
          return 1; 
        },
      };
    }
    return null;
  },
  findByPk: async (id) => id === '1' ? { 
    par_id: '1', 
    par_nome: 'Telecom Plus', 
    par_dominio: 'telecomplus.com',
    destroy: async () => {
      return 1; 
    },
  } : null,
  create: async (data) => ({ par_id: '2', ...data }),
  update: async () => [1],
  destroy: async () => 1,
  count: async () => 1,
};

describe('ParceiroService - Real Coverage', () => {
  let service;
  beforeEach(() => {
    service = new ParceiroService(fakeParceiroModel);
  });

  it('findByDomain deve buscar por domínio', async () => {
    const parceiro = await service.findByDomain('telecomplus.com');
    expect(parceiro).toBeDefined();
  });

  it('create deve criar novo parceiro', async () => {
    const parceiro = await service.create({
      par_nome: 'Novo Parceiro',
      par_dominio: 'novo.com',
      par_cidade: 'Rio',
    });
    expect(parceiro.par_id).toBeDefined();
    expect(parceiro.par_nome).toBe('Novo Parceiro');
  });

  it('delete deve remover parceiro', async () => {
    const result = await service.delete('1');
    expect(result).toBeDefined();
    expect(result.par_id).toBe('1');
  });

  it('calculateDistance deve calcular distância Haversine corretamente', () => {
    // João Pessoa para Campina Grande (~111 km)
    const distance = service.calculateDistance(-7.115556, -34.878056, -7.229444, -35.881111);
    expect(distance).toBeGreaterThan(100);
    expect(distance).toBeLessThan(120);
  });

  it('calculateDistance deve retornar 0 para mesma coordenada', () => {
    const distance = service.calculateDistance(-7.115556, -34.878056, -7.115556, -34.878056);
    expect(distance).toBe(0);
  });

  it('validateLocationData deve aceitar coordenadas válidas', () => {
    const data = {
      par_latitude: -7.115556,
      par_longitude: -34.878056,
      par_raio_cobertura: 50,
    };
    expect(() => service.validateLocationData(data)).not.toThrow();
  });

  it('validateLocationData deve rejeitar latitude inválida', () => {
    expect(() => service.validateLocationData({ par_latitude: 91 })).toThrow();
  });

  it('validateLocationData deve rejeitar longitude inválida', () => {
    expect(() => service.validateLocationData({ par_longitude: 181 })).toThrow();
  });

  it('validateLocationData deve rejeitar raio negativo', () => {
    expect(() => service.validateLocationData({ par_raio_cobertura: -5 })).toThrow();
  });

  it('findNearby deve rejeitar latitude ausente', async () => {
    await expect(service.findNearby(null, -34.878056)).rejects.toThrow();
  });

  it('findNearby deve rejeitar longitude ausente', async () => {
    await expect(service.findNearby(-7.115556, null)).rejects.toThrow();
  });

  it('findNearby deve rejeitar coordenadas inválidas', async () => {
    await expect(service.findNearby(91, -34.878056)).rejects.toThrow();
    await expect(service.findNearby(-7.115556, 181)).rejects.toThrow();
  });
});
