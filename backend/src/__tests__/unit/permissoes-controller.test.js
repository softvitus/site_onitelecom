/**
 * PermissoesController - Unit Tests
 * Testa endpoints e respostas HTTP do controller
 */

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

jest.mock('../../services/AuditoriaService.js', () => ({
  AuditoriaService: {
    registrar: jest.fn().mockResolvedValue({}),
    sanitizarDados: jest.fn((d) => d),
  },
}));

jest.mock('../../config/sequelize.js', () => ({
  default: {},
  sequelize: {},
}));

import { PermissoesController } from '../../controllers/PermissoesController.js';

describe('PermissoesController - Unit Tests', () => {
  let controller;
  let mockService;
  let mockRes;
  let mockReq;
  let mockNext;

  const createMockModel = (data) => ({
    ...data,
    toJSON: () => data,
  });

  beforeEach(() => {
    mockService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByModulo: jest.fn(),
      findByAcao: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createPayload: jest.fn(),
      updatePayload: jest.fn(),
    };

    controller = new PermissoesController();
    controller.service = mockService;

    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };

    mockReq = {
      params: {},
      query: {},
      body: {},
      user: { id: '1', tipo: 'admin' },
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
  describe('getAll - GET /api/permissoes', () => {
    it('deve retornar lista de permissões com paginação', async () => {
      const mockPermissoes = [
        { perm_id: '1', perm_nome: 'tema_editar', perm_modulo: 'tema', perm_acao: 'editar' },
        { perm_id: '2', perm_nome: 'tema_visualizar', perm_modulo: 'tema', perm_acao: 'visualizar' },
      ];

      mockService.findAll.mockResolvedValue({
        rows: mockPermissoes,
        pagination: { page: 1, limit: 50, total: 2 },
      });

      mockReq.query = { page: 1, limit: 50 };

      await controller.getAll(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockPermissoes,
        pagination: expect.objectContaining({ total: 2 }),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve usar valores padrão de paginação', async () => {
      mockService.findAll.mockResolvedValue({
        rows: [],
        pagination: { page: 1, limit: 50, total: 0 },
      });

      await controller.getAll(mockReq, mockRes, mockNext);

      expect(mockService.findAll).toHaveBeenCalledWith(
        {},
        { page: 1, limit: 50 },
      );
    });

    it('deve chamar next com erro quando serviço falha', async () => {
      const error = new Error('Service error');
      mockService.findAll.mockRejectedValue(error);

      await controller.getAll(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ========== TESTES: getById ==========
  describe('getById - GET /api/permissoes/:id', () => {
    it('deve retornar permissão por ID', async () => {
      const mockPermissao = {
        perm_id: '123',
        perm_nome: 'tema_editar',
        perm_modulo: 'tema',
        perm_acao: 'editar',
      };

      mockService.findById.mockResolvedValue(mockPermissao);
      mockReq.params = { id: '123' };

      await controller.getById(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockPermissao,
      });
    });

    it('deve retornar 404 se permissão não existe', async () => {
      mockService.findById.mockResolvedValue(null);
      mockReq.params = { id: 'inexistente' };

      await controller.getById(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Permissão não encontrada',
      });
    });

    it('deve chamar next com erro quando serviço falha', async () => {
      const error = new Error('Database error');
      mockService.findById.mockRejectedValue(error);
      mockReq.params = { id: '123' };

      await controller.getById(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ========== TESTES: create ==========
  describe('create - POST /api/permissoes', () => {
    it('deve criar nova permissão', async () => {
      const createData = {
        perm_nome: 'usuario_criar',
        perm_modulo: 'usuario',
        perm_acao: 'criar',
        perm_descricao: 'Cria novo usuário',
      };

      const createdPermissao = createMockModel({
        perm_id: '999',
        ...createData,
      });

      mockService.createPayload.mockResolvedValue(createdPermissao);
      mockReq.body = createData;

      await controller.create(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: createdPermissao,
      });
    });

    it('deve chamar AuditoriaService ao criar', async () => {
      const { AuditoriaService } = require('../../services/AuditoriaService.js');
      
      const createData = {
        perm_nome: 'usuario_criar',
        perm_modulo: 'usuario',
        perm_acao: 'criar',
      };

      const createdPermissao = createMockModel({
        perm_id: '999',
        ...createData,
      });

      mockService.createPayload.mockResolvedValue(createdPermissao);
      mockReq.body = createData;

      await controller.create(mockReq, mockRes, mockNext);

      expect(AuditoriaService.registrar).toHaveBeenCalledWith(
        expect.objectContaining({
          acao: 'criar',
          entidade: 'permissao',
          status: 'sucesso',
        }),
      );
    });

    it('deve chamar next com erro quando createPayload falha', async () => {
      const error = new Error('Validation error');
      mockService.createPayload.mockRejectedValue(error);
      mockReq.body = { perm_modulo: 'usuario', perm_acao: 'criar' };

      await controller.create(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ========== TESTES: update ==========
  describe('update - PUT /api/permissoes/:id', () => {
    it('deve atualizar permissão existente', async () => {
      const updateData = { perm_descricao: 'Nova descrição' };
      const anterior = createMockModel({
        perm_id: '123',
        perm_nome: 'tema_editar',
        perm_descricao: 'Descrição antiga',
      });
      const updated = createMockModel({
        perm_id: '123',
        ...anterior,
        ...updateData,
      });

      mockService.findById.mockResolvedValue(anterior);
      mockService.updatePayload.mockResolvedValue(updated);
      mockReq.params = { id: '123' };
      mockReq.body = updateData;

      await controller.update(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: updated,
      });
    });

    it('deve retornar 404 se permissão não existe', async () => {
      mockService.findById.mockResolvedValue(null);
      mockReq.params = { id: 'inexistente' };
      mockReq.body = { perm_descricao: 'Updated' };

      await controller.update(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Permissão não encontrada',
      });
    });

    it('deve chamar AuditoriaService ao atualizar', async () => {
      const { AuditoriaService } = require('../../services/AuditoriaService.js');
      
      const anterior = createMockModel({ perm_id: '123', perm_nome: 'tema_editar' });
      const updated = createMockModel({ perm_id: '123', perm_nome: 'tema_editar_v2' });

      mockService.findById.mockResolvedValue(anterior);
      mockService.updatePayload.mockResolvedValue(updated);
      mockReq.params = { id: '123' };
      mockReq.body = { perm_nome: 'tema_editar_v2' };

      await controller.update(mockReq, mockRes, mockNext);

      expect(AuditoriaService.registrar).toHaveBeenCalledWith(
        expect.objectContaining({
          acao: 'atualizar',
          entidade: 'permissao',
          status: 'sucesso',
        }),
      );
    });
  });

  // ========== TESTES: remove ==========
  describe('remove - DELETE /api/permissoes/:id', () => {
    it('deve deletar permissão existente', async () => {
      const permissao = createMockModel({
        perm_id: '123',
        perm_nome: 'tema_editar',
      });

      mockService.findById.mockResolvedValue(permissao);
      mockService.delete.mockResolvedValue(true);
      mockReq.params = { id: '123' };

      await controller.remove(mockReq, mockRes, mockNext);

      expect(mockService.delete).toHaveBeenCalledWith('123');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Permissão deletada com sucesso',
      });
    });

    it('deve retornar 404 se permissão não existe', async () => {
      mockService.findById.mockResolvedValue(null);
      mockReq.params = { id: 'inexistente' };

      await controller.remove(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Permissão não encontrada',
      });
    });
  });

  // ========== TESTES: getByModulo ==========
  describe('getByModulo - GET /api/permissoes/modulo/:modulo', () => {
    it('deve retornar permissões por módulo', async () => {
      const mockPermissoes = [
        { perm_id: '1', perm_nome: 'tema_editar', perm_modulo: 'tema' },
        { perm_id: '2', perm_nome: 'tema_visualizar', perm_modulo: 'tema' },
        { perm_id: '3', perm_nome: 'tema_deletar', perm_modulo: 'tema' },
      ];

      mockService.findByModulo.mockResolvedValue({
        rows: mockPermissoes,
        pagination: { page: 1, limit: 50, total: 3 },
      });

      mockReq.params = { modulo: 'tema' };
      mockReq.query = { page: 1, limit: 50 };

      await controller.getByModulo(mockReq, mockRes, mockNext);

      expect(mockService.findByModulo).toHaveBeenCalledWith(
        'tema',
        { page: 1, limit: 50 },
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockPermissoes,
        pagination: expect.any(Object),
      });
    });

    it('deve usar limite padrão de 50 itens', async () => {
      mockService.findByModulo.mockResolvedValue({
        rows: [],
        pagination: { page: 1, limit: 50, total: 0 },
      });

      mockReq.params = { modulo: 'tema' };
      mockReq.query = {};

      await controller.getByModulo(mockReq, mockRes, mockNext);

      expect(mockService.findByModulo).toHaveBeenCalledWith(
        'tema',
        { page: 1, limit: 50 },
      );
    });
  });

  // ========== TESTES: getByAcao ==========
  describe('getByAcao - GET /api/permissoes/acao/:acao', () => {
    it('deve retornar permissões por ação', async () => {
      const mockPermissoes = [
        { perm_id: '1', perm_nome: 'tema_editar', perm_acao: 'editar' },
        { perm_id: '4', perm_nome: 'usuario_editar', perm_acao: 'editar' },
        { perm_id: '7', perm_nome: 'pagina_editar', perm_acao: 'editar' },
      ];

      mockService.findByAcao.mockResolvedValue({
        rows: mockPermissoes,
        pagination: { page: 1, limit: 50, total: 3 },
      });

      mockReq.params = { acao: 'editar' };
      mockReq.query = { page: 1, limit: 50 };

      await controller.getByAcao(mockReq, mockRes, mockNext);

      expect(mockService.findByAcao).toHaveBeenCalledWith(
        'editar',
        { page: 1, limit: 50 },
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockPermissoes,
        pagination: expect.any(Object),
      });
    });

    it('deve converter page e limit para inteiros', async () => {
      mockService.findByAcao.mockResolvedValue({
        rows: [],
        pagination: { page: 2, limit: 50, total: 0 },
      });

      mockReq.params = { acao: 'editar' };
      mockReq.query = { page: '2', limit: '50' };

      await controller.getByAcao(mockReq, mockRes, mockNext);

      expect(mockService.findByAcao).toHaveBeenCalledWith(
        'editar',
        { page: 2, limit: 50 },
      );
    });
  });
});
