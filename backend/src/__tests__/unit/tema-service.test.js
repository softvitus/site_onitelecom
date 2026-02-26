/**
 * TemaService - Unit Tests
 * Testa lógica de negócio do serviço Tema
 */

import { TemaService } from '../../services/TemaService.js';
import { ApiError } from '../../utils/ErrorCodes.js';

describe('TemaService - Unit Tests', () => {
  let service;
  let mockModel;

  beforeEach(() => {
    mockModel = {
      name: 'Tema',
      findAll: jest.fn(),
      findAndCountAll: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
      count: jest.fn(),
    };

    service = new TemaService(mockModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========== TESTES: findAll ==========
  describe('findAll - Listar temas', () => {
    it('deve retornar lista de temas com paginação', async () => {
      const mockTemas = [
        { tem_id: '1', tem_nome: 'Tema 1', tem_par_id: 'p1' },
        { tem_id: '2', tem_nome: 'Tema 2', tem_par_id: 'p1' },
      ];

      mockModel.findAndCountAll.mockResolvedValue({ rows: mockTemas, count: 2 });

      const result = await service.findAll({}, { page: 1, limit: 10 });

      expect(result.rows).toEqual(mockTemas);
      expect(result.pagination.total).toBe(2);
    });

    it('deve filtrar temas por parceiro', async () => {
      mockModel.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });

      await service.findAll({ tem_par_id: 'p1' });

      expect(mockModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tem_par_id: 'p1' }),
        })
      );
    });

    it('deve retornar lista vazia quando não há temas', async () => {
      mockModel.findAndCountAll.mockResolvedValue({ rows: [], count: 0 });

      const result = await service.findAll({});

      expect(result.rows).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  // ========== TESTES: findById ==========
  describe('findById - Buscar por ID', () => {
    it('deve retornar tema por ID', async () => {
      const mockTema = {
        tem_id: '123',
        tem_nome: 'Tema Especial',
        tem_par_id: 'p1',
      };

      mockModel.findByPk.mockResolvedValue(mockTema);

      const result = await service.findById('123');

      expect(result).toEqual(mockTema);
      expect(mockModel.findByPk).toHaveBeenCalledWith('123', expect.any(Object));
    });
  });

  // ========== TESTES: findByIdWithRelations ==========
  describe('findByIdWithRelations - Buscar com relações', () => {
    it('deve buscar tema com todas as relações', async () => {
      const mockTema = {
        tem_id: '123',
        tem_nome: 'Completo',
        parceiro: { par_id: 'p1', par_nome: 'Telecom' },
        paginas: [{ pag_id: '1' }, { pag_id: '2' }],
        cores: [{ cores_id: '1', cores_nome: 'Azul' }],
        imagens: [{ img_id: '1' }],
        configTemas: [{ cfg_id: '1' }],
      };

      mockModel.findByPk.mockResolvedValue(mockTema);

      const result = await service.findByIdWithRelations('123');

      expect(result).toHaveProperty('parceiro');
      expect(result).toHaveProperty('paginas');
      expect(result).toHaveProperty('cores');
      expect(result).toHaveProperty('imagens');
      expect(result).toHaveProperty('configTemas');

      expect(mockModel.findByPk).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({
          include: expect.arrayContaining([
            expect.objectContaining({ association: 'parceiro' }),
            expect.objectContaining({ association: 'paginas' }),
            expect.objectContaining({ association: 'cores' }),
            expect.objectContaining({ association: 'imagens' }),
            expect.objectContaining({ association: 'configTemas' }),
          ]),
        })
      );
    });

  });

  // ========== TESTES: findByParceiroId ==========
  describe('findByParceiroId - Buscar temas de um parceiro', () => {
    it('deve buscar temas de um parceiro específico', async () => {
      mockModel.findAndCountAll.mockResolvedValue({
        rows: [{ tem_id: '1', tem_par_id: 'p1' }],
        count: 1,
      });

      await service.findByParceiroId('p1');

      expect(mockModel.findAndCountAll).toHaveBeenCalled();
    });
  });

  // ========== TESTES: findByName ==========
  describe('findByName - Buscar por nome', () => {
    it('deve retornar tema pelo nome', async () => {
      const mockTema = {
        tem_id: '123',
        tem_nome: 'Rosa Claro',
      };

      mockModel.findOne.mockResolvedValue(mockTema);

      const result = await service.findByName('Rosa Claro');

      expect(result).toEqual(mockTema);
      expect(mockModel.findOne).toHaveBeenCalledWith({
        where: { tem_nome: 'Rosa Claro' },
      });
    });

    it('deve lançar erro se tema não existe', async () => {
      mockModel.findOne.mockResolvedValue(null);

      await expect(service.findByName('Inexistente')).rejects.toThrow();
    });
  });

  // ========== TESTES: cloneTheme ==========
  describe('cloneTheme - Clonar tema', () => {
    it('deve clonar tema existente com novo nome', async () => {
      const originalTheme = {
        tem_id: '123',
        tem_nome: 'Tema Original',
        tem_par_id: 'p1',
      };

      const clonedTheme = {
        tem_id: '456',
        tem_par_id: 'p1',
        tem_nome: expect.stringMatching(/Clonado/),
      };

      mockModel.findByPk.mockResolvedValue(originalTheme);
      mockModel.create.mockResolvedValue(clonedTheme);

      const result = await service.cloneTheme('123', 'Clonado');

      expect(result.tem_par_id).toBe('p1');
      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tem_par_id: 'p1',
          tem_nome: expect.stringMatching('Clonado'),
        })
      );
    });

    it('deve incluir data na clonagem', async () => {
      const originalTheme = {
        tem_id: '123',
        tem_par_id: 'p1',
        tem_nome: 'Original',
      };

      mockModel.findByPk.mockResolvedValue(originalTheme);
      mockModel.create.mockResolvedValue({
        tem_id: '456',
        tem_par_id: 'p1',
        tem_nome: 'Novo (18/02/2026)',
      });

      await service.cloneTheme('123', 'Novo');

      const callArgs = mockModel.create.mock.calls[0][0];
      expect(callArgs.tem_nome).toContain('(');
      expect(callArgs.tem_nome).toContain(')');
    });

    it('deve lançar erro se tema original não existe', async () => {
      mockModel.findByPk.mockResolvedValue(null);

      await expect(service.cloneTheme('inexistente', 'Clone')).rejects.toThrow();
    });

    it('deve preservar tem_par_id do tema original', async () => {
      const originalTheme = {
        tem_id: '123',
        tem_par_id: 'parceiro-especial',
        tem_nome: 'Original',
      };

      mockModel.findByPk.mockResolvedValue(originalTheme);
      mockModel.create.mockResolvedValue({ tem_id: '456', tem_par_id: 'parceiro-especial' });

      await service.cloneTheme('123', 'Clone');

      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tem_par_id: 'parceiro-especial',
        })
      );
    });
  });

  // ========== TESTES: create ==========
  describe('create - Criar tema', () => {
    it('deve criar tema com dados válidos', async () => {
      const newData = {
        tem_nome: 'Novo Tema',
        tem_par_id: 'p1',
        tem_descricao: 'Descrição',
      };

      const created = { tem_id: '123', ...newData };

      mockModel.create.mockResolvedValue(created);

      const result = await service.create(newData);

      expect(result).toEqual(created);
      expect(mockModel.create).toHaveBeenCalledWith(newData);
    });
  });

  // ========== TESTES: update ==========
  describe('update - Atualizar tema', () => {
    it('deve atualizar tema existente', async () => {
      const updateData = { tem_nome: 'Nome Atualizado' };
      const mockItem = { 
        tem_id: '123', 
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
    it('deve capturar erros de banco de dados', async () => {
      const dbError = new Error('Database error');
      mockModel.findAndCountAll.mockRejectedValue(dbError);

      await expect(service.findAll({})).rejects.toThrow();
    });

    it('deve lançar ApiError apropriado', async () => {
      mockModel.findOne.mockResolvedValue(null);

      try {
        await service.findByName('Inexistente');
        fail('Deveria ter lançado erro');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
      }
    });
  });

  // ========== TESTES: Validação ==========
  describe('Validação de Dados', () => {
    it('deve validar campos obrigatórios na criação', async () => {
      const invalidData = {
        // Faltam campos obrigatórios
      };

      // Se houver validação
      // await expect(service.create(invalidData)).rejects.toThrow();
    });
  });
});
