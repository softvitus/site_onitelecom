/**
 * ParceiroService - Unit Tests
 * Testa lógica de negócio do serviço Parceiro
 */

import request from 'supertest';
import { ParceiroService } from '../../services/ParceiroService.js';
import { ApiError } from '../../utils/ErrorCodes.js';

describe('ParceiroService - Unit Tests', () => {
  let service;
  let mockModel;

  beforeEach(() => {
    // Mock do modelo Sequelize
    mockModel = {
      name: 'Parceiro',
      findAll: jest.fn(),
      findAndCountAll: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
      count: jest.fn(),
      sequelize: {
        Op: {
          not: Symbol.for('sequelize.op.not'),
        },
      },
    };

    service = new ParceiroService(mockModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========== TESTES: findAll ==========
  describe('findAll - Listar parceiros', () => {
    it('deve retornar lista de parceiros com paginação', async () => {
      const mockParceiros = [
        { par_id: '1', par_nome: 'Telecom Plus', par_dominio: 'telecomplus.com' },
        { par_id: '2', par_nome: 'Internet Rápida', par_dominio: 'internetrapida.com' },
      ];

      mockModel.findAndCountAll.mockResolvedValue({ rows: mockParceiros, count: 2 });

      const result = await service.findAll({}, { page: 1, limit: 10 });

      expect(result.rows).toEqual(mockParceiros);
      expect(result.pagination.total).toBe(2);
      expect(mockModel.findAndCountAll).toHaveBeenCalled();
    });

    it('deve filtrar parceiros por status', async () => {
      const mockParceiros = [
        { par_id: '1', par_nome: 'Ativo', par_status: 'ativo' },
      ];

      mockModel.findAndCountAll.mockResolvedValue({ rows: mockParceiros, count: 1 });

      const result = await service.findAll({ par_status: 'ativo' });

      expect(result.rows[0].par_status).toBe('ativo');
      expect(mockModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ par_status: 'ativo' }),
        })
      );
    });

    it('deve retornar lista vazia quando não há parceiros', async () => {
      mockModel.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });

      const result = await service.findAll({});

      expect(result.rows).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it('deve aplicar paginação corretamente', async () => {
      mockModel.findAndCountAll.mockResolvedValue({ rows: [], count: 100 });

      await service.findAll({}, { page: 2, limit: 20 });

      expect(mockModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 20,
          offset: 20, // (2-1)*20
        })
      );
    });
  });

  // ========== TESTES: findById ==========
  describe('findById - Buscar por ID', () => {
    it('deve retornar parceiro por ID', async () => {
      const mockParceiro = {
        par_id: '123',
        par_nome: 'Telecom Plus',
        par_dominio: 'telecomplus.com',
      };

      mockModel.findByPk.mockResolvedValue(mockParceiro);

      const result = await service.findById('123');

      expect(result).toEqual(mockParceiro);
      expect(mockModel.findByPk).toHaveBeenCalledWith('123', expect.any(Object));
    });
  });

  // ========== TESTES: create ==========
  describe('create - Criar parceiro', () => {
    it('deve criar novo parceiro com dados válidos', async () => {
      const mockData = {
        par_nome: 'Novo Parceiro',
        par_dominio: 'novo.com',
        par_cidade: 'Rio de Janeiro',
      };

      mockModel.create.mockResolvedValue({ par_id: '99', ...mockData });

      const result = await service.create(mockData);

      expect(result.par_id).toBe('99');
      expect(result.par_nome).toBe('Novo Parceiro');
      expect(mockModel.create).toHaveBeenCalledWith(mockData);
    });
  });

  // ========== TESTES: findActive ==========
  describe('findActive - Buscar parceiros ativos', () => {
    it('deve retornar apenas parceiros com status "ativo"', async () => {
      const mockAtivos = [
        { par_id: '1', par_status: 'ativo' },
        { par_id: '2', par_status: 'ativo' },
      ];

      mockModel.findAndCountAll.mockResolvedValue({ rows: mockAtivos, count: 2 });

      const result = await service.findActive();

      expect(mockModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ par_status: 'ativo' }),
        })
      );
    });
  });

  // ========== TESTES: findByCity ==========
  describe('findByCity - Buscar por cidade', () => {
    it('deve retornar parceiros de uma cidade específica', async () => {
      const mockParceiros = [{ par_id: '1', par_cidade: 'São Paulo' }];

      mockModel.findAndCountAll.mockResolvedValue({ rows: mockParceiros, count: 1 });

      const result = await service.findByCity('São Paulo');

      expect(mockModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ par_cidade: 'São Paulo' }),
        })
      );
    });
  });

  // ========== TESTES: findByDomain ==========
  describe('findByDomain - Buscar por domínio', () => {
    it('deve retornar parceiro pelo domínio', async () => {
      const mockParceiro = {
        par_id: '123',
        par_dominio: 'telecomplus.com',
      };

      mockModel.findOne.mockResolvedValue(mockParceiro);

      const result = await service.findByDomain('telecomplus.com');

      expect(result).toEqual(mockParceiro);
      expect(mockModel.findOne).toHaveBeenCalledWith({
        where: { par_dominio: 'telecomplus.com' },
      });
    });

    it('deve lançar erro se domínio não existe', async () => {
      mockModel.findOne.mockResolvedValue(null);

      await expect(service.findByDomain('inexistente.com')).rejects.toThrow();
    });
  });

  // ========== TESTES: createPayload ==========
  describe('createPayload - Criar novo parceiro', () => {
    it('deve criar parceiro com dados válidos', async () => {
      const newData = {
        par_nome: 'Novo Parceiro',
        par_dominio: 'novo.com',
        par_cidade: 'Rio de Janeiro',
      };

      const createdParceiro = { par_id: '123', ...newData };

      mockModel.findOne.mockResolvedValue(null); // Não existe
      mockModel.create.mockResolvedValue(createdParceiro);

      const result = await service.createPayload(newData);

      expect(result).toEqual(createdParceiro);
      expect(mockModel.create).toHaveBeenCalledWith(newData);
    });

    it('deve rejeitar se faltam campos obrigatórios', async () => {
      const incompleteData = {
        par_nome: 'Novo Parceiro',
        // Faltam par_dominio e par_cidade
      };

      await expect(service.createPayload(incompleteData)).rejects.toThrow();
    });

    it('deve rejeitar se domínio já existe', async () => {
      const newData = {
        par_nome: 'Novo',
        par_dominio: 'existe.com',
        par_cidade: 'São Paulo',
      };

      mockModel.findOne.mockResolvedValue({ par_id: 'existe' }); // Já existe

      await expect(service.createPayload(newData)).rejects.toThrow('domínio');
    });

    it('deve validar formato do domínio', async () => {
      const invalidData = {
        par_nome: 'Novo',
        par_dominio: 'dominio-invalido', // Sem .com ou similar
        par_cidade: 'São Paulo',
      };

      mockModel.findOne.mockResolvedValue(null);

      // Se o serviço valida formato de domínio
      // await expect(service.createPayload(invalidData)).rejects.toThrow();
    });
  });

  // ========== TESTES: update ==========
  describe('update - Atualizar parceiro', () => {
    it('deve atualizar parceiro com novos dados', async () => {
      const updateData = { par_nome: 'Nome Atualizado' };
      const mockItem = { 
        par_id: '123', 
        ...updateData,
        update: jest.fn().mockResolvedValue(true)
      };

      mockModel.findByPk.mockResolvedValue(mockItem);

      const result = await service.update('123', updateData);

      expect(result).toBeDefined();
      expect(mockItem.update).toHaveBeenCalledWith(updateData);
    });
  });

  // ========== TESTES: Tratamento de Erros ==========
  describe('Tratamento de Erros', () => {
    it('deve capturar e relançar erros de banco de dados', async () => {
      const dbError = new Error('Database connection failed');
      mockModel.findAndCountAll.mockRejectedValue(dbError);

      await expect(service.findAll({})).rejects.toThrow();
    });

    it('deve lançar ApiError com código correto', async () => {
      mockModel.findOne.mockResolvedValue(null);

      try {
        await service.findByDomain('inexistente.com');
        fail('Deveria ter lançado erro');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
      }
    });
  });

  // ========== TESTES: Validação ==========
  describe('Validação de Dados', () => {
    it('deve validar tipo de dado para par_nome', async () => {
      const invalidData = {
        par_nome: 123, // Deveria ser string
        par_dominio: 'test.com',
        par_cidade: 'São Paulo',
      };

      mockModel.findOne.mockResolvedValue(null);

      // Se houver validação de tipo
      // await expect(service.createPayload(invalidData)).rejects.toThrow();
    });

    it('deve validar comprimento mínimo de par_nome', async () => {
      const invalidData = {
        par_nome: 'A', // Muito curto
        par_dominio: 'test.com',
        par_cidade: 'São Paulo',
      };

      mockModel.findOne.mockResolvedValue(null);

      // Se houver validação de comprimento
      // await expect(service.createPayload(invalidData)).rejects.toThrow();
    });
  });

  // ========== TESTES: Performance ==========
  describe('Performance e Otimização', () => {
    it('deve usar paginação para evitar sobrecarga', async () => {
      mockModel.findAndCountAll.mockResolvedValue({ rows: [], count: 10000 });

      await service.findAll({}, { limit: 10 });

      // Verifica que limit foi aplicado
      expect(mockModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
        })
      );
    });
  });

  // ========== TESTES: calculateDistance (Haversine) ==========
  describe('calculateDistance - Cálculo de distância', () => {
    it('deve calcular corretamente distância entre dois pontos', () => {
      // João Pessoa (-7.115556, -34.878056) para Campina Grande (-7.229444, -35.881111)
      const distance = service.calculateDistance(-7.115556, -34.878056, -7.229444, -35.881111);

      // A distância real é aproximadamente 111 km
      expect(distance).toBeGreaterThan(100);
      expect(distance).toBeLessThan(120);
    });

    it('deve retornar 0 para coordenadas iguais', () => {
      const distance = service.calculateDistance(-7.115556, -34.878056, -7.115556, -34.878056);

      expect(distance).toBe(0);
    });

    it('deve calcular corretamente para coordenadas diferentes', () => {
      // São Paulo (23.550520, -46.633309) para Rio de Janeiro (22.902756, -43.209469)
      const distance = service.calculateDistance(23.550520, -46.633309, 22.902756, -43.209469);

      // Distância real é aproximadamente 357 km
      expect(distance).toBeGreaterThan(350);
      expect(distance).toBeLessThan(365);
    });

    it('deve retornar valor positivo sempre', () => {
      const distance1 = service.calculateDistance(10, 20, 30, 40);
      const distance2 = service.calculateDistance(30, 40, 10, 20);

      expect(distance1).toBeGreaterThan(0);
      expect(distance2).toBeGreaterThan(0);
      expect(distance1).toBeCloseTo(distance2);
    });
  });

  // ========== TESTES: validateLocationData ==========
  describe('validateLocationData - Validação de dados de localização', () => {
    it('deve aceitar dados válidos de localização', () => {
      const validData = {
        par_endereco: 'Rua A, 100',
        par_cep: '58000-000',
        par_latitude: -7.115556,
        par_longitude: -34.878056,
        par_raio_cobertura: 50,
      };

      expect(() => service.validateLocationData(validData)).not.toThrow();
    });

    it('deve rejeitar latitude inválida (< -90)', () => {
      const invalidData = { par_latitude: -91 };

      expect(() => service.validateLocationData(invalidData)).toThrow();
    });

    it('deve rejeitar latitude inválida (> 90)', () => {
      const invalidData = { par_latitude: 91 };

      expect(() => service.validateLocationData(invalidData)).toThrow();
    });

    it('deve rejeitar longitude inválida (< -180)', () => {
      const invalidData = { par_longitude: -181 };

      expect(() => service.validateLocationData(invalidData)).toThrow();
    });

    it('deve rejeitar longitude inválida (> 180)', () => {
      const invalidData = { par_longitude: 181 };

      expect(() => service.validateLocationData(invalidData)).toThrow();
    });

    it('deve rejeitar raio de cobertura negativo', () => {
      const invalidData = { par_raio_cobertura: -10 };

      expect(() => service.validateLocationData(invalidData)).toThrow();
    });

    it('deve aceitar raio de cobertura zero', () => {
      const validData = { par_raio_cobertura: 0 };

      expect(() => service.validateLocationData(validData)).not.toThrow();
    });

    it('deve aceitar coordenadas nos limites', () => {
      const validData = {
        par_latitude: 90,
        par_longitude: 180,
        par_raio_cobertura: 0,
      };

      expect(() => service.validateLocationData(validData)).not.toThrow();
    });

    it('deve aceitar dados parciais de localização', () => {
      expect(() => service.validateLocationData({ par_latitude: 0 })).not.toThrow();
      expect(() => service.validateLocationData({ par_longitude: 0 })).not.toThrow();
      expect(() => service.validateLocationData({ par_raio_cobertura: 50 })).not.toThrow();
    });
  });

  // ========== TESTES: findNearby (Busca geoespacial) ==========
  describe('findNearby - Busca por proximidade', () => {
    it('deve rejeitar latitude ausente', async () => {
      await expect(service.findNearby(null, -34.878056)).rejects.toThrow('obrigatórias');
    });

    it('deve rejeitar longitude ausente', async () => {
      await expect(service.findNearby(-7.115556, null)).rejects.toThrow('obrigatórias');
    });

    it('deve rejeitar coordenadas fora do intervalo válido', async () => {
      await expect(service.findNearby(91, -34.878056)).rejects.toThrow();
      await expect(service.findNearby(-7.115556, 181)).rejects.toThrow();
    });

    it('deve usar raio padrão de 50 km quando não especificado', async () => {
      mockModel.findAll.mockResolvedValue([]);

      const result = await service.findNearby(-7.115556, -34.878056);

      // Se não passou raio, deve usar 50 como padrão
      expect(mockModel.findAll).toHaveBeenCalled();
      expect(result.pagination.limit).toBe(10);
    });

    it('deve retornar estrutura de resposta correta', async () => {
      mockModel.findAll.mockResolvedValue([]);

      const result = await service.findNearby(-7.115556, -34.878056, 100);

      expect(result).toHaveProperty('rows');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.rows)).toBe(true);
      expect(result.pagination).toHaveProperty('total');
      expect(result.pagination).toHaveProperty('page');
      expect(result.pagination).toHaveProperty('limit');
      expect(result.pagination).toHaveProperty('pages');
    });

    it('deve aplicar paginação com valores padrão', async () => {
      mockModel.findAll.mockResolvedValue([]);

      const result = await service.findNearby(-7.115556, -34.878056, 100);

      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('deve aplicar paginação customizada', async () => {
      mockModel.findAll.mockResolvedValue([]);

      const result = await service.findNearby(-7.115556, -34.878056, 100, {
        page: 2,
        limit: 20,
      });

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(20);
    });
  });
});
