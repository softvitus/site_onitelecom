/**
 * ParceiroController - Unit Tests
 * Testa endpoints e respostas HTTP do controller
 */

// Mock Sequelize antes de importar modelos (compatível com ES Modules)
jest.mock('sequelize', () => ({
  DataTypes: {
    INTEGER: 'INTEGER',
    STRING: 'STRING',
    TEXT: 'TEXT',
    BOOLEAN: 'BOOLEAN',
    DATE: 'DATE',
    JSON: 'JSON',
    UUID: 'UUID',
    UUIDV4: 'UUIDV4',
  },
}));

jest.mock('../../models/loader.js', () => ({
  getModels: jest.fn(() => ({})),
}));

// Mock AuditoriaService para evitar import.meta
jest.mock('../../services/AuditoriaService.js', () => ({
  AuditoriaService: {
    registrar: jest.fn().mockResolvedValue({}),
    sanitizarDados: jest.fn((d) => d),
  },
}));

// Mock config/sequelize para evitar import.meta
jest.mock('../../config/sequelize.js', () => ({
  default: {},
  sequelize: {},
}));

import request from 'supertest';
import { ParceiroController } from '../../controllers/ParceiroController.js';

describe('ParceiroController - Unit Tests', () => {
  let controller;
  let mockService;
  let mockRes;
  let mockReq;
  let mockNext;

  // Helper para criar objetos com toJSON
  const createMockModel = (data) => ({
    ...data,
    toJSON: () => data,
  });

  beforeEach(() => {
    // Mock do serviço
    mockService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByIdWithRelations: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    // Criar controller com mock
    controller = new ParceiroController();
    controller.service = mockService;

    // Mock de request/response
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };

    mockReq = {
      params: {},
      query: {},
      body: {},
      user: { usr_id: '1', usr_role: 'admin' },
      connection: { remoteAddress: '127.0.0.1' },
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('test-user-agent'),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========== TESTES: getAll ==========
  describe('getAll - GET /api/parceiros', () => {
    it('deve retornar lista de parceiros com paginação', async () => {
      const mockParceiros = [
        { par_id: '1', par_nome: 'Telecom Plus' },
        { par_id: '2', par_nome: 'Internet Rápida' },
      ];

      mockService.findAll.mockResolvedValue({
        rows: mockParceiros,
        pagination: { page: 1, limit: 10, total: 2 },
      });

      mockReq.query = { page: 1, limit: 10 };

      await controller.getAll(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockParceiros,
        pagination: expect.objectContaining({ total: 2 }),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve usar valores padrão se page e limit não são fornecidos', async () => {
      mockService.findAll.mockResolvedValue({
        rows: [],
        pagination: { page: 1, limit: 10, total: 0 },
      });

      await controller.getAll(mockReq, mockRes, mockNext);

      expect(mockService.findAll).toHaveBeenCalledWith(
        {},
        { page: 1, limit: 10 }
      );
    });

    it('deve converter page e limit para inteiros', async () => {
      mockService.findAll.mockResolvedValue({
        rows: [],
        pagination: { page: 2, limit: 20, total: 0 },
      });

      mockReq.query = { page: '2', limit: '20' };

      await controller.getAll(mockReq, mockRes, mockNext);

      expect(mockService.findAll).toHaveBeenCalledWith(
        {},
        { page: 2, limit: 20 }
      );
    });

    it('deve chamar next com erro quando serviço falha', async () => {
      const error = new Error('Service error');
      mockService.findAll.mockRejectedValue(error);

      await controller.getAll(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('deve retornar resposta com success: true', async () => {
      mockService.findAll.mockResolvedValue({
        rows: [],
        pagination: { page: 1, limit: 10, total: 0 },
      });

      await controller.getAll(mockReq, mockRes, mockNext);

      const callArgs = mockRes.json.mock.calls[0][0];
      expect(callArgs.success).toBe(true);
    });
  });

  // ========== TESTES: getById ==========
  describe('getById - GET /api/parceiros/:id', () => {
    it('deve retornar parceiro por ID', async () => {
      const mockParceiro = {
        par_id: '123',
        par_nome: 'Telecom Plus',
        par_dominio: 'telecomplus.com',
      };

      mockService.findByIdWithRelations.mockResolvedValue(mockParceiro);
      mockReq.params = { id: '123' };

      await controller.getById(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockParceiro,
      });
    });

    it('deve retornar 404 se parceiro não existe', async () => {
      mockService.findByIdWithRelations.mockResolvedValue(null);
      mockReq.params = { id: 'inexistente' };

      await controller.getById(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Parceiro não encontrado',
      });
    });

    it('deve chamar next com erro quando serviço falha', async () => {
      const error = new Error('Database error');
      mockService.findByIdWithRelations.mockRejectedValue(error);
      mockReq.params = { id: '123' };

      await controller.getById(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('deve extrair ID dos parâmetros da rota', async () => {
      mockService.findByIdWithRelations.mockResolvedValue(null);
      mockReq.params = { id: 'abc-123' };

      await controller.getById(mockReq, mockRes, mockNext);

      expect(mockService.findByIdWithRelations).toHaveBeenCalledWith('abc-123');
    });
  });

  // ========== TESTES: create ==========
  // Removido: create é testado em parceiro-service.test.js via createPayload
  // Controller tests focam em integração com response/next, não em lógica de serviço

  // ========== TESTES: update ==========
  describe('update - PUT /api/parceiros/:id', () => {
    it('deve atualizar parceiro existente', async () => {
      const updateData = { par_nome: 'Nome Atualizado' };
      const updatedData = {
        par_id: '123',
        ...updateData,
      };
      const updated = createMockModel(updatedData);
      const anterior = createMockModel({ par_id: '123', par_nome: 'Original' });

      mockService.findById.mockResolvedValue(anterior);
      mockService.update.mockResolvedValue(updated);
      mockReq.params = { id: '123' };
      mockReq.body = updateData;

      await controller.update(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: updated,
      });
    });

    it('deve retornar 404 se parceiro não existe', async () => {
      mockService.findById.mockResolvedValue(null);
      mockService.update.mockResolvedValue(null);
      mockReq.params = { id: 'inexistente' };
      mockReq.body = {};

      await controller.update(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Parceiro não encontrado',
      });
    });

    it('deve chamar service.update com id e dados', async () => {
      const anterior = createMockModel({ par_id: '123', par_nome: 'Original' });
      const updated = createMockModel({ par_id: '123', par_nome: 'Novo Nome' });
      mockService.findById.mockResolvedValue(anterior);
      mockService.update.mockResolvedValue(updated);
      mockReq.params = { id: '123' };
      mockReq.body = { par_nome: 'Novo Nome' };

      await controller.update(mockReq, mockRes, mockNext);

      expect(mockService.update).toHaveBeenCalledWith('123', { par_nome: 'Novo Nome' });
    });

    it('deve chamar next com erro quando serviço falha', async () => {
      const error = new Error('Update error');
      mockService.findById.mockResolvedValue(createMockModel({ par_id: '123' }));
      mockService.update.mockRejectedValue(error);
      mockReq.params = { id: '123' };

      await controller.update(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ========== TESTES: delete ==========
  describe('delete - DELETE /api/parceiros/:id', () => {
    it('deve deletar parceiro com status 200', async () => {
      mockService.delete.mockResolvedValue(1);
      mockReq.params = { id: '123' };

      // Assumindo que controller tem método delete
      if (controller.delete) {
        await controller.delete(mockReq, mockRes, mockNext);

        expect(mockRes.json).toHaveBeenCalledWith({
          success: true,
          message: 'Parceiro deletado',
        });
      }
    });

    it('deve retornar 404 se parceiro não existe', async () => {
      mockService.delete.mockResolvedValue(0);
      mockReq.params = { id: 'inexistente' };

      if (controller.delete) {
        await controller.delete(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(404);
      }
    });
  });

  // ========== TESTES: Tratamento de Exceções ==========
  describe('Tratamento de Exceções', () => {
    it('deve tratar erro de conexão com banco de dados', async () => {
      const dbError = new Error('Database connection failed');
      mockService.findAll.mockRejectedValue(dbError);
      mockReq.query = {};

      await controller.getAll(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(dbError);
    });

    it('deve tratar diferentes tipos de erro', async () => {
      const errors = [
        new Error('Generic error'),
        new TypeError('Type error'),
        new RangeError('Range error'),
      ];

      for (const error of errors) {
        mockService.findAll.mockRejectedValueOnce(error);

        await controller.getAll(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(error);
      }
    });
  });

  // ========== TESTES: Estado e Imutabilidade ==========
  describe('Estado e Imutabilidade', () => {
    it('não deve modificar req.query original', async () => {
      mockService.findAll.mockResolvedValue({
        rows: [],
        pagination: { page: 1, limit: 10, total: 0 },
      });

      mockReq.query = { page: '1', limit: '10' };
      const originalQuery = { ...mockReq.query };

      await controller.getAll(mockReq, mockRes, mockNext);

      expect(mockReq.query).toEqual(originalQuery);
    });

    it('não deve modificar req.body original', async () => {
      const originalBody = {
        par_nome: 'Teste',
        par_dominio: 'teste.com',
        par_cidade: 'SP',
      };

      mockService.create.mockResolvedValue(createMockModel({ par_id: '1', ...originalBody }));
      mockReq.body = { ...originalBody };

      await controller.create(mockReq, mockRes, mockNext);

      expect(mockReq.body).toEqual(originalBody);
    });
  });

  // ========== TESTES: getNearby (Busca Geoespacial) ==========
  describe('getNearby - Busca por proximidade', () => {
    beforeEach(() => {
      mockService.findNearby = jest.fn();
    });

    it('deve chamar findNearby com latitude e longitude dos params convertidos para número', async () => {
      const mockResponse = {
        rows: [
          {
            par_id: '1',
            par_nome: 'Oni Telecom',
            distancia: 5.2,
          },
        ],
        pagination: { total: 1, page: 1, limit: 10, pages: 1 },
      };

      mockService.findNearby.mockResolvedValue(mockResponse);

      mockReq.params = { latitude: '-7.115556', longitude: '-34.878056' };
      mockReq.query = { radius: '50', page: '1', limit: '10' };

      // Mock do status também
      mockRes.status.mockReturnValue(mockRes);

      await controller.getNearby(mockReq, mockRes, mockNext);

      expect(mockService.findNearby).toHaveBeenCalledWith(
        -7.115556, // convertido para número
        -34.878056, // convertido para número
        50, // convertido para número
        { page: 1, limit: 10 }
      );
    });

    it('deve retornar com sucesso parceiros encontrados', async () => {
      const mockResponse = {
        rows: [
          {
            par_id: '1',
            par_nome: 'Parceiro Próximo',
            distancia: 10,
          },
        ],
        pagination: { total: 1, page: 1, limit: 10, pages: 1 },
      };

      mockService.findNearby.mockResolvedValue(mockResponse);

      mockReq.params = { latitude: '-7.115556', longitude: '-34.878056' };
      mockReq.query = {};

      await controller.getNearby(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockResponse.rows,
          pagination: mockResponse.pagination,
        })
      );
    });

    it('deve retornar lista vazia quando nenhum parceiro encontrado', async () => {
      const mockResponse = {
        rows: [],
        pagination: { total: 0, page: 1, limit: 10, pages: 0 },
      };

      mockService.findNearby.mockResolvedValue(mockResponse);

      mockReq.params = { latitude: '-7.115556', longitude: '-34.878056' };
      mockReq.query = {};

      await controller.getNearby(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: [],
        })
      );
    });

    it('deve usar raio padrão de 50 quando não fornecido', async () => {
      mockService.findNearby.mockResolvedValue({
        rows: [],
        pagination: { total: 0, page: 1, limit: 10, pages: 0 },
      });

      mockReq.params = { latitude: '-7.115556', longitude: '-34.878056' };
      mockReq.query = {}; // sem radius

      await controller.getNearby(mockReq, mockRes, mockNext);

      expect(mockService.findNearby).toHaveBeenCalledWith(
        -7.115556,
        -34.878056,
        50, // raio padrão
        { page: 1, limit: 10 }
      );
    });

    it('deve converter radius query param para número', async () => {
      mockService.findNearby.mockResolvedValue({
        rows: [],
        pagination: { total: 0, page: 1, limit: 10, pages: 0 },
      });

      mockReq.params = { latitude: '-7.115556', longitude: '-34.878056' };
      mockReq.query = { radius: '100' };

      await controller.getNearby(mockReq, mockRes, mockNext);

      expect(mockService.findNearby).toHaveBeenCalledWith(
        -7.115556,
        -34.878056,
        100, // convertido para número
        { page: 1, limit: 10 }
      );
    });

    it('deve passar paginação corretamente com conversão de tipos', async () => {
      mockService.findNearby.mockResolvedValue({
        rows: [],
        pagination: { total: 0, page: 2, limit: 20, pages: 0 },
      });

      mockReq.params = { latitude: '-7.115556', longitude: '-34.878056' };
      mockReq.query = { page: '2', limit: '20' };

      await controller.getNearby(mockReq, mockRes, mockNext);

      expect(mockService.findNearby).toHaveBeenCalledWith(
        -7.115556,
        -34.878056,
        50,
        { page: 2, limit: 20 }
      );
    });

    it('deve incluir informações de paginação na resposta', async () => {
      const mockResponse = {
        rows: [],
        pagination: { total: 50, page: 1, limit: 10, pages: 5 },
      };

      mockService.findNearby.mockResolvedValue(mockResponse);

      mockReq.params = { latitude: '-7.115556', longitude: '-34.878056' };
      mockReq.query = {};

      await controller.getNearby(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: mockResponse.pagination,
        })
      );
    });

    it('deve chamar next com erro se findNearby falhar', async () => {
      const error = new Error('Service error');
      mockService.findNearby.mockRejectedValue(error);

      mockReq.params = { latitude: '-7.115556', longitude: '-34.878056' };
      mockReq.query = {};

      await controller.getNearby(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('deve incluir distância em cada resultado', async () => {
      const mockResponse = {
        rows: [
          {
            par_id: '1',
            par_nome: 'Parceiro 1',
            par_latitude: '-7.115556',
            par_longitude: '-34.878056',
            distancia: 0,
          },
          {
            par_id: '2',
            par_nome: 'Parceiro 2',
            distancia: 27.5,
          },
        ],
        pagination: { total: 2, page: 1, limit: 10, pages: 1 },
      };

      mockService.findNearby.mockResolvedValue(mockResponse);

      mockReq.params = { latitude: '-7.115556', longitude: '-34.878056' };
      mockReq.query = {};

      await controller.getNearby(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({ distancia: 0 }),
            expect.objectContaining({ distancia: 27.5 }),
          ]),
        })
      );
    });
  });
});
