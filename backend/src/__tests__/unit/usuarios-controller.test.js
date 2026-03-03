/**
 * UsuariosController - Unit Tests
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

import { UsuariosController } from '../../controllers/UsuariosController.js';

describe('UsuariosController - Unit Tests', () => {
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
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByType: jest.fn(),
    };

    controller = new UsuariosController();
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
  describe('getAll - GET /api/usuarios', () => {
    it('deve retornar lista de usuários com paginação', async () => {
      const mockUsuarios = [
        createMockModel({ usu_id: '1', usu_nome: 'Admin', usu_email: 'admin@test.com', usu_tipo: 'admin' }),
        createMockModel({ usu_id: '2', usu_nome: 'Gestor', usu_email: 'gestor@test.com', usu_tipo: 'gestor' }),
      ];

      mockService.findAll.mockResolvedValue({
        rows: mockUsuarios,
        pagination: { page: 1, limit: 10, total: 2 },
      });

      mockReq.query = { page: 1, limit: 10 };

      await controller.getAll(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({ usu_id: '1', usu_nome: 'Admin' }),
          expect.objectContaining({ usu_id: '2', usu_nome: 'Gestor' }),
        ]),
        pagination: expect.objectContaining({ total: 2 }),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve remover senha das respostas', async () => {
      const mockUsuarios = [
        createMockModel({ usu_id: '1', usu_nome: 'Admin', usu_email: 'admin@test.com', usu_senha: 'should_be_removed' }),
      ];

      mockService.findAll.mockResolvedValue({
        rows: mockUsuarios,
        pagination: { page: 1, limit: 10, total: 1 },
      });

      await controller.getAll(mockReq, mockRes, mockNext);

      const callArgs = mockRes.json.mock.calls[0][0];
      expect(callArgs.data[0]).not.toHaveProperty('usu_senha');
    });

    it('deve usar valores padrão de paginação', async () => {
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

    it('deve chamar next com erro quando serviço falha', async () => {
      const error = new Error('Service error');
      mockService.findAll.mockRejectedValue(error);

      await controller.getAll(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ========== TESTES: getById ==========
  describe('getById - GET /api/usuarios/:id', () => {
    it('deve retornar usuário por ID', async () => {
      const mockUsuario = createMockModel({
        usu_id: '123',
        usu_nome: 'Admin',
        usu_email: 'admin@test.com',
        usu_tipo: 'admin',
      });

      mockService.findById.mockResolvedValue(mockUsuario);
      mockReq.params = { id: '123' };

      await controller.getById(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          usu_id: '123',
          usu_nome: 'Admin',
        }),
      });
    });

    it('deve retornar 404 se usuário não existe', async () => {
      mockService.findById.mockResolvedValue(null);
      mockReq.params = { id: 'inexistente' };

      await controller.getById(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Usuário não encontrado',
      });
    });

    it('deve remover senha da resposta', async () => {
      const mockUsuario = createMockModel({
        usu_id: '123',
        usu_nome: 'Admin',
        usu_email: 'admin@test.com',
        usu_senha: 'should_be_removed',
      });

      mockService.findById.mockResolvedValue(mockUsuario);
      mockReq.params = { id: '123' };

      await controller.getById(mockReq, mockRes, mockNext);

      const callArgs = mockRes.json.mock.calls[0][0];
      expect(callArgs.data).not.toHaveProperty('usu_senha');
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
  describe('create - POST /api/usuarios', () => {
    it('deve criar novo usuário com senha hash', async () => {
      const createData = {
        usu_email: 'novo@test.com',
        usu_nome: 'Novo Usuário',
        usu_senha: 'senha123',
        usu_tipo: 'gestor',
      };

      const createdUser = createMockModel({
        usu_id: '999',
        ...createData,
        usu_senha: 'hashed_password',
      });

      mockService.create.mockResolvedValue(createdUser);
      mockReq.body = createData;

      await controller.create(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
      });
    });

    it('deve retornar 400 se email está vazio', async () => {
      mockReq.body = {
        usu_nome: 'Novo Usuário',
        usu_senha: 'senha123',
      };

      await controller.create(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json.mock.calls[0][0].success).toBe(false);
    });

    it('deve retornar 400 se nome está vazio', async () => {
      mockReq.body = {
        usu_email: 'novo@test.com',
        usu_senha: 'senha123',
      };

      await controller.create(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('deve retornar 400 se senha está vazia', async () => {
      mockReq.body = {
        usu_email: 'novo@test.com',
        usu_nome: 'Novo Usuário',
      };

      await controller.create(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('deve remover senha da resposta de criação', async () => {
      const createData = {
        usu_email: 'novo@test.com',
        usu_nome: 'Novo Usuário',
        usu_senha: 'senha123',
      };

      const createdUser = {
        usu_id: '999',
        ...createData,
        usu_senha: 'hashed_password',
        toJSON: () => ({
          usu_id: '999',
          usu_email: 'novo@test.com',
          usu_nome: 'Novo Usuário',
          usu_senha: 'hashed_password',
        }),
      };

      mockService.create.mockResolvedValue(createdUser);
      mockReq.body = createData;

      await controller.create(mockReq, mockRes, mockNext);

      const callArgs = mockRes.json.mock.calls[0][0];
      expect(callArgs.data).not.toHaveProperty('usu_senha');
    });
  });

  // ========== TESTES: update ==========
  describe('update - PUT /api/usuarios/:id', () => {
    it('deve atualizar usuário existente', async () => {
      const updateData = { usu_nome: 'Admin Atualizado' };
      const anterior = createMockModel({ usu_id: '123', usu_nome: 'Admin Original' });
      const updated = createMockModel({ usu_id: '123', ...updateData });

      mockService.findById.mockResolvedValue(anterior);
      mockService.update.mockResolvedValue(updated);
      mockReq.params = { id: '123' };
      mockReq.body = updateData;

      await controller.update(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({ usu_id: '123', usu_nome: 'Admin Atualizado' }),
      });
    });

    it('deve retornar 404 se usuário não existe', async () => {
      mockService.findById.mockResolvedValue(null);
      mockReq.params = { id: 'inexistente' };
      mockReq.body = { usu_nome: 'Updated' };

      await controller.update(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('deve remover senha da resposta de atualização', async () => {
      const anterior = createMockModel({ usu_id: '123', usu_nome: 'Admin' });
      const updated = createMockModel({
        usu_id: '123',
        usu_nome: 'Admin Updated',
        usu_senha: 'new_hash',
      });

      mockService.findById.mockResolvedValue(anterior);
      mockService.update.mockResolvedValue(updated);
      mockReq.params = { id: '123' };
      mockReq.body = { usu_nome: 'Admin Updated' };

      await controller.update(mockReq, mockRes, mockNext);

      const callArgs = mockRes.json.mock.calls[0][0];
      expect(callArgs.data).not.toHaveProperty('usu_senha');
    });
  });

  // ========== TESTES: remove ==========
  describe('remove - DELETE /api/usuarios/:id', () => {
    it('deve deletar usuário existente', async () => {
      const usuario = createMockModel({ usu_id: '123', usu_nome: 'Admin' });

      mockService.findById.mockResolvedValue(usuario);
      mockService.delete.mockResolvedValue(true);
      mockReq.params = { id: '123' };

      await controller.remove(mockReq, mockRes, mockNext);

      expect(mockService.delete).toHaveBeenCalledWith('123');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Usuário deletado com sucesso',
      });
    });

    it('deve retornar 404 se usuário não existe', async () => {
      mockService.findById.mockResolvedValue(null);
      mockReq.params = { id: 'inexistente' };

      await controller.remove(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Usuário não encontrado',
      });
    });

    it('deve chamar next com erro quando serviço falha', async () => {
      const error = new Error('Database error');
      const usuario = createMockModel({ usu_id: '123' });

      mockService.findById.mockResolvedValue(usuario);
      mockService.delete.mockRejectedValue(error);
      mockReq.params = { id: '123' };

      await controller.remove(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ========== TESTES: getByType ==========
  describe('getByType - GET /api/usuarios/tipo/:tipo', () => {
    it('deve retornar usuários por tipo', async () => {
      const mockUsuarios = [
        createMockModel({ usu_id: '1', usu_nome: 'Gestor 1', usu_tipo: 'gestor' }),
        createMockModel({ usu_id: '2', usu_nome: 'Gestor 2', usu_tipo: 'gestor' }),
      ];

      mockService.findByType.mockResolvedValue({
        rows: mockUsuarios,
        pagination: { page: 1, limit: 10, total: 2 },
      });

      mockReq.params = { tipo: 'gestor' };
      mockReq.query = { page: 1, limit: 10 };

      await controller.getByType(mockReq, mockRes, mockNext);

      expect(mockService.findByType).toHaveBeenCalledWith(
        'gestor',
        { page: 1, limit: 10 }
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({ usu_id: '1' }),
          expect.objectContaining({ usu_id: '2' }),
        ]),
        pagination: expect.any(Object),
      });
    });

    it('deve remover senhas na listagem por tipo', async () => {
      const mockUsuarios = [
        createMockModel({ usu_id: '1', usu_nome: 'Gestor 1', usu_senha: 'must_remove' }),
      ];

      mockService.findByType.mockResolvedValue({
        rows: mockUsuarios,
        pagination: { page: 1, limit: 10, total: 1 },
      });

      mockReq.params = { tipo: 'gestor' };
      mockReq.query = {};

      await controller.getByType(mockReq, mockRes, mockNext);

      const callArgs = mockRes.json.mock.calls[0][0];
      expect(callArgs.data[0]).not.toHaveProperty('usu_senha');
    });
  });

  // ========== TESTES: updateStatus ==========
  describe('updateStatus - PUT /api/usuarios/:id/status', () => {
    it('deve atualizar status do usuário', async () => {
      const usuario = createMockModel({
        usu_id: '123',
        usu_nome: 'Admin',
        usu_status: 'ativo',
        dataValues: {
          usu_id: '123',
          usu_nome: 'Admin',
          usu_status: 'inativo',
        },
      });

      mockService.update.mockResolvedValue(usuario);

      mockReq.params = { id: '123' };
      mockReq.body = { usu_status: 'inativo' };

      await controller.updateStatus(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalled();
      expect(mockRes.json.mock.calls[0][0].success).toBe(true);
    });

    it('deve retornar 400 se status é inválido', async () => {
      mockReq.params = { id: '123' };
      mockReq.body = { usu_status: 'status_invalido' };

      await controller.updateStatus(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('deve retornar 404 se usuário não existe', async () => {
      mockService.update.mockRejectedValue(new Error('User not found'));

      mockReq.params = { id: 'inexistente' };
      mockReq.body = { usu_status: 'inativo' };

      await controller.updateStatus(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
