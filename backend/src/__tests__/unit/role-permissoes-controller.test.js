/**
 * RolePermissoesController - Unit Tests
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

import { RolePermissoesController } from '../../controllers/RolePermissoesController.js';

describe('RolePermissoesController - Unit Tests', () => {
  let controller;
  let mockService;
  let mockRes;
  let mockReq;
  let mockNext;

  beforeEach(() => {
    mockService = {
      findByTipo: jest.fn(),
      atribuirPermissao: jest.fn(),
      removerPermissao: jest.fn(),
      replacePermissoes: jest.fn(),
      temPermissao: jest.fn(),
    };

    controller = new RolePermissoesController();
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

  // ========== TESTES: getByTipo ==========
  describe('getByTipo - GET /api/role-permissoes/:tipo', () => {
    it('deve retornar todas as permissões de um role', async () => {
      const mockPermissoes = [
        { perm_id: '1', perm_nome: 'tema_editar', perm_modulo: 'tema' },
        { perm_id: '2', perm_nome: 'tema_visualizar', perm_modulo: 'tema' },
        { perm_id: '3', perm_nome: 'usuario_editar', perm_modulo: 'usuario' },
      ];

      mockService.findByTipo.mockResolvedValue(mockPermissoes);
      mockReq.params = { tipo: 'admin' };

      await controller.getByTipo(mockReq, mockRes, mockNext);

      expect(mockService.findByTipo).toHaveBeenCalledWith('admin');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        tipo: 'admin',
        data: mockPermissoes,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve retornar array vazio se role não tem permissões', async () => {
      mockService.findByTipo.mockResolvedValue([]);
      mockReq.params = { tipo: 'usuario' };

      await controller.getByTipo(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        tipo: 'usuario',
        data: [],
      });
    });

    it('deve chamar next com erro quando serviço falha', async () => {
      const error = new Error('Database error');
      mockService.findByTipo.mockRejectedValue(error);
      mockReq.params = { tipo: 'admin' };

      await controller.getByTipo(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ========== TESTES: atribuirPermissao ==========
  describe('atribuirPermissao - POST /api/role-permissoes/:tipo/permissoes/:permissaoId', () => {
    it('deve atribuir permissão a um role', async () => {
      const mockRolePermissao = {
        rol_perm_id: '999',
        rol_tipo: 'admin',
        perm_id: '123',
        created_at: new Date(),
      };

      mockService.atribuirPermissao.mockResolvedValue(mockRolePermissao);
      mockReq.params = { tipo: 'admin', permissaoId: '123' };

      await controller.atribuirPermissao(mockReq, mockRes, mockNext);

      expect(mockService.atribuirPermissao).toHaveBeenCalledWith('admin', '123');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Permissão atribuída ao role admin',
        data: mockRolePermissao,
      });
    });

    it('deve chamar AuditoriaService ao atribuir', async () => {
      const { AuditoriaService } = require('../../services/AuditoriaService.js');
      
      mockService.atribuirPermissao.mockResolvedValue({
        rol_perm_id: '999',
        rol_tipo: 'admin',
        perm_id: '123',
      });

      mockReq.params = { tipo: 'admin', permissaoId: '123' };

      await controller.atribuirPermissao(mockReq, mockRes, mockNext);

      expect(AuditoriaService.registrar).toHaveBeenCalledWith(
        expect.objectContaining({
          acao: 'atribuir',
          entidade: 'role_permissao',
          status: 'sucesso',
        }),
      );
    });

    it('deve chamar next com erro quando serviço falha', async () => {
      const error = new Error('Service error');
      mockService.atribuirPermissao.mockRejectedValue(error);
      mockReq.params = { tipo: 'admin', permissaoId: '123' };

      await controller.atribuirPermissao(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ========== TESTES: removerPermissao ==========
  describe('removerPermissao - DELETE /api/role-permissoes/:tipo/permissoes/:permissaoId', () => {
    it('deve remover permissão de um role', async () => {
      mockService.removerPermissao.mockResolvedValue(true);
      mockReq.params = { tipo: 'admin', permissaoId: '123' };

      await controller.removerPermissao(mockReq, mockRes, mockNext);

      expect(mockService.removerPermissao).toHaveBeenCalledWith('admin', '123');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Permissão removida do role admin',
      });
    });

    it('deve retornar 404 se permissão não está atribuída ao role', async () => {
      mockService.removerPermissao.mockResolvedValue(null);
      mockReq.params = { tipo: 'admin', permissaoId: 'inexistente' };

      await controller.removerPermissao(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Permissão não encontrada para este role',
      });
    });

    it('deve chamar AuditoriaService ao remover', async () => {
      const { AuditoriaService } = require('../../services/AuditoriaService.js');
      
      mockService.removerPermissao.mockResolvedValue(true);
      mockReq.params = { tipo: 'admin', permissaoId: '123' };

      await controller.removerPermissao(mockReq, mockRes, mockNext);

      expect(AuditoriaService.registrar).toHaveBeenCalledWith(
        expect.objectContaining({
          acao: 'remover',
          entidade: 'role_permissao',
          status: 'sucesso',
        }),
      );
    });

    it('deve chamar next com erro quando serviço falha', async () => {
      const error = new Error('Service error');
      mockService.removerPermissao.mockRejectedValue(error);
      mockReq.params = { tipo: 'admin', permissaoId: '123' };

      await controller.removerPermissao(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ========== TESTES: replacePermissoes ==========
  describe('replacePermissoes - PUT /api/role-permissoes/:tipo/permissoes', () => {
    it('deve substituir todas as permissões de um role', async () => {
      const novasPermissoes = [
        { perm_id: '1', perm_nome: 'tema_editar' },
        { perm_id: '2', perm_nome: 'usuario_visualizar' },
      ];

      mockService.findByTipo.mockResolvedValueOnce([
        { perm_id: '5', perm_nome: 'antiga1' },
      ]); // Permissões anteriores

      mockService.replacePermissoes.mockResolvedValue(true);

      mockService.findByTipo.mockResolvedValueOnce(novasPermissoes); // Permissões novas

      mockReq.params = { tipo: 'admin' };
      mockReq.body = { permissaoIds: ['1', '2'] };

      await controller.replacePermissoes(mockReq, mockRes, mockNext);

      expect(mockService.replacePermissoes).toHaveBeenCalledWith('admin', ['1', '2']);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Permissões atualizadas para o role admin',
        tipo: 'admin',
        data: novasPermissoes,
      });
    });

    it('deve retornar 400 se permissaoIds não é um array', async () => {
      mockReq.params = { tipo: 'admin' };
      mockReq.body = { permissaoIds: 'nao_eh_array' };

      await controller.replacePermissoes(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'permissaoIds deve ser um array',
      });
    });

    it('deve aceitar array vazio para remover todas as permissões', async () => {
      mockService.findByTipo.mockResolvedValueOnce([
        { perm_id: '1', perm_nome: 'tema_editar' },
      ]); // Anteriores

      mockService.replacePermissoes.mockResolvedValue(true);
      mockService.findByTipo.mockResolvedValueOnce([]); // Novas (vazio)

      mockReq.params = { tipo: 'usuario' };
      mockReq.body = { permissaoIds: [] };

      await controller.replacePermissoes(mockReq, mockRes, mockNext);

      expect(mockService.replacePermissoes).toHaveBeenCalledWith('usuario', []);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Permissões atualizadas para o role usuario',
        tipo: 'usuario',
        data: [],
      });
    });

    it('deve chamar AuditoriaService ao substituir permissões', async () => {
      const { AuditoriaService } = require('../../services/AuditoriaService.js');
      
      mockService.findByTipo.mockResolvedValueOnce([{ perm_id: '5' }]);
      mockService.replacePermissoes.mockResolvedValue(true);
      mockService.findByTipo.mockResolvedValueOnce([]);

      mockReq.params = { tipo: 'admin' };
      mockReq.body = { permissaoIds: ['1', '2'] };

      await controller.replacePermissoes(mockReq, mockRes, mockNext);

      expect(AuditoriaService.registrar).toHaveBeenCalledWith(
        expect.objectContaining({
          acao: 'substituir_permissoes',
          entidade: 'role_permissao',
          status: 'sucesso',
        }),
      );
    });

    it('deve chamar next com erro quando serviço falha', async () => {
      const error = new Error('Service error');
      mockService.findByTipo.mockRejectedValue(error);
      mockReq.params = { tipo: 'admin' };
      mockReq.body = { permissaoIds: ['1'] };

      await controller.replacePermissoes(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ========== TESTES: temPermissao ==========
  describe('temPermissao - GET /api/role-permissoes/:tipo/tem/:permissaoNome', () => {
    it('deve retornar true quando role tem permissão', async () => {
      mockService.temPermissao.mockResolvedValue(true);
      mockReq.params = { tipo: 'admin', permissaoNome: 'tema_editar' };

      await controller.temPermissao(mockReq, mockRes, mockNext);

      expect(mockService.temPermissao).toHaveBeenCalledWith('admin', 'tema_editar');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        tipo: 'admin',
        permissao: 'tema_editar',
        tem: true,
      });
    });

    it('deve retornar false quando role não tem permissão', async () => {
      mockService.temPermissao.mockResolvedValue(false);
      mockReq.params = { tipo: 'usuario', permissaoNome: 'usuario_deletar' };

      await controller.temPermissao(mockReq, mockRes, mockNext);

      expect(mockService.temPermissao).toHaveBeenCalledWith('usuario', 'usuario_deletar');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        tipo: 'usuario',
        permissao: 'usuario_deletar',
        tem: false,
      });
    });

    it('deve chamar next com erro quando serviço falha', async () => {
      const error = new Error('Service error');
      mockService.temPermissao.mockRejectedValue(error);
      mockReq.params = { tipo: 'admin', permissaoNome: 'tema_editar' };

      await controller.temPermissao(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
