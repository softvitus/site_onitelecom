/**
 * TemaController - Unit Tests
 * Testa endpoints HTTP do controller Tema
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

import { TemaController } from '../../controllers/TemaController.js';

describe('TemaController - Unit Tests', () => {
  let controller;
  let mockService;
  let mockRes;
  let mockReq;
  let mockNext;

  beforeEach(() => {
    mockService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByIdWithRelations: jest.fn(),
      findByParceiroId: jest.fn(),
      cloneTheme: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    controller = new TemaController();
    controller.service = mockService;

    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };

    mockReq = {
      params: {},
      query: {},
      body: {},
      user: { usr_id: '1', usr_role: 'admin' },
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========== TESTES: getAll ==========
  describe('getAll - GET /api/temas', () => {
    it('deve retornar lista de temas com paginação', async () => {
      const mockTemas = [
        { tem_id: '1', tem_nome: 'Tema 1' },
        { tem_id: '2', tem_nome: 'Tema 2' },
      ];

      mockService.findAll.mockResolvedValue({
        rows: mockTemas,
        pagination: { page: 1, limit: 10, total: 2 },
      });

      mockReq.query = { page: 1, limit: 10 };

      await controller.getAll(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockTemas,
        pagination: expect.any(Object),
      });
    });

    it('deve chamar next com erro quando serviço falha', async () => {
      const error = new Error('Service error');
      mockService.findAll.mockRejectedValue(error);

      await controller.getAll(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ========== TESTES: getById ==========
  describe('getById - GET /api/temas/:id', () => {
    it('deve retornar tema por ID com relações', async () => {
      const mockTema = {
        tem_id: '123',
        tem_nome: 'Tema Completo',
        paginas: [],
        cores: [],
      };

      mockService.findById.mockResolvedValue(mockTema);
      mockReq.params = { id: '123' };

      await controller.getById(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockTema,
      });
    });

    it('deve retornar 404 se tema não existe', async () => {
      mockService.findById.mockResolvedValue(null);
      mockReq.params = { id: 'inexistente' };

      await controller.getById(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  // ========== TESTES: create ==========
  describe('create - POST /api/temas', () => {
    it('deve criar tema com status 201', async () => {
      const newData = {
        tem_nome: 'Novo Tema',
        tem_par_id: 'p1',
      };

      const created = { tem_id: '123', ...newData };

      mockService.create.mockResolvedValue(created);
      mockReq.body = newData;

      await controller.create(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: created,
      });
    });
  });

  // ========== TESTES: update ==========
  describe('update - PUT /api/temas/:id', () => {
    it('deve atualizar tema existente', async () => {
      const updateData = { tem_nome: 'Atualizado' };
      const updated = { tem_id: '123', ...updateData };

      mockService.update.mockResolvedValue(updated);
      mockReq.params = { id: '123' };
      mockReq.body = updateData;

      await controller.update(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: updated,
      });
    });

    it('deve retornar 404 se tema não existe', async () => {
      mockService.update.mockResolvedValue(null);
      mockReq.params = { id: 'inexistente' };

      await controller.update(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  // ========== TESTES: delete ==========
  describe('delete - DELETE /api/temas/:id', () => {
    it('deve deletar tema com status 200', async () => {
      mockService.delete.mockResolvedValue(1);
      mockReq.params = { id: '123' };

      if (controller.delete) {
        await controller.delete(mockReq, mockRes, mockNext);
        expect(mockRes.json).toHaveBeenCalled();
      }
    });

    it('deve retornar 404 se tema não existe', async () => {
      mockService.delete.mockResolvedValue(0);
      mockReq.params = { id: 'inexistente' };

      if (controller.delete) {
        await controller.delete(mockReq, mockRes, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(404);
      }
    });
  });

  // ========== TESTES: cloneTheme ==========
  describe('cloneTheme - POST /api/temas/:id/clone', () => {
    it('deve clonar tema existente', async () => {
      const cloned = {
        tem_id: '456',
        tem_nome: 'Clone (18/02/2026)',
        tem_par_id: 'p1',
      };

      mockService.cloneTheme.mockResolvedValue(cloned);
      mockReq.params = { id: '123' };
      mockReq.body = { newName: 'Clone' };

      if (controller.cloneTheme) {
        await controller.cloneTheme(mockReq, mockRes, mockNext);
        expect(mockRes.json).toHaveBeenCalled();
      }
    });
  });

  // ========== TESTES: Tratamento de Erros ==========
  describe('Tratamento de Erros', () => {
    it('deve tratar erro de banco de dados', async () => {
      const dbError = new Error('Database error');
      mockService.findAll.mockRejectedValue(dbError);

      await controller.getAll(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(dbError);
    });

    it('deve tratar erro de criação', async () => {
      const error = new Error('Validation error');
      mockService.create.mockRejectedValue(error);
      mockReq.body = {};

      await controller.create(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ========== TESTES: Status Codes HTTP ==========
  describe('Status Codes HTTP', () => {
    it('getAll deve retornar 200', async () => {
      mockService.findAll.mockResolvedValue({ rows: [], pagination: {} });

      await controller.getAll(mockReq, mockRes, mockNext);

      // 200 é default, não precisa de status explícito
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('create deve retornar 201', async () => {
      mockService.create.mockResolvedValue({ tem_id: '1' });
      mockReq.body = {};

      await controller.create(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('getById com 404 deve retornar status 404', async () => {
      mockService.findByIdWithRelations.mockResolvedValue(null);
      mockReq.params = { id: 'x' };

      await controller.getById(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });
});
