import { TemaService } from '../../services/TemaService.js';
import { BaseService } from '../../services/BaseService.js';
import { ApiError } from '../../utils/ErrorCodes.js';

/**
 * TemaService - Testes Avançados de Cobertura
 * Aumenta cobertura testando métodos avançados
 */
describe('TemaService - Cobertura Avançada', () => {
  let temaService;
  let mockModel;

  beforeEach(() => {
    // Mock do modelo Sequelize
    mockModel = {
      findByPk: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
      findOne: jest.fn(),
    };

    temaService = new TemaService(mockModel);
  });

  describe('Herança de BaseService', () => {
    it('TemaService deve estender BaseService', () => {
      expect(temaService).toBeInstanceOf(BaseService);
      expect(temaService).toBeInstanceOf(TemaService);
    });

    it('deve ter acesso a this.model', () => {
      expect(temaService.model).toBe(mockModel);
    });
  });

  describe('findByIdWithRelations', () => {
    it('deve chamar findById com opções de include', async () => {
      const mockTheme = { id: 1, name: 'Theme 1' };
      jest.spyOn(temaService, 'findById').mockResolvedValue(mockTheme);

      const result = await temaService.findByIdWithRelations(1);

      expect(temaService.findById).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          include: expect.arrayContaining([
            expect.objectContaining({ association: 'parceiro' }),
            expect.objectContaining({ association: 'paginas' }),
            expect.objectContaining({ association: 'cores' }),
            expect.objectContaining({ association: 'imagens' }),
            expect.objectContaining({ association: 'configTemas' }),
          ]),
        }),
      );
      expect(result).toEqual(mockTheme);
    });
  });

  describe('findByParceiroId', () => {
    it('deve chamar findAll com filtro de parceiro', async () => {
      const mockTemas = [{ id: 1, tem_par_id: 1 }];
      jest.spyOn(temaService, 'findAll').mockResolvedValue(mockTemas);

      const result = await temaService.findByParceiroId(1);

      expect(temaService.findAll).toHaveBeenCalledWith({ tem_par_id: 1 }, {});
      expect(result).toEqual(mockTemas);
    });

    it('deve aceitar opções de paginação', async () => {
      jest.spyOn(temaService, 'findAll').mockResolvedValue([]);

      await temaService.findByParceiroId(1, { page: 2, limit: 20 });

      expect(temaService.findAll).toHaveBeenCalledWith({ tem_par_id: 1 }, { page: 2, limit: 20 });
    });
  });

  describe('findByName', () => {
    it('deve retornar tema quando encontrado', async () => {
      const mockTema = { id: 1, tem_nome: 'Tema Premium' };
      mockModel.findOne.mockResolvedValue(mockTema);

      const result = await temaService.findByName('Tema Premium');

      expect(mockModel.findOne).toHaveBeenCalledWith({
        where: { tem_nome: 'Tema Premium' },
      });
      expect(result).toEqual(mockTema);
    });

    it('deve lançar ApiError quando não encontrado', async () => {
      mockModel.findOne.mockResolvedValue(null);

      await expect(temaService.findByName('Inexistente')).rejects.toThrow(ApiError);
      await expect(temaService.findByName('Inexistente')).rejects.toThrow('Tema não encontrado');
    });

    it('deve usar case-sensitive na busca', async () => {
      mockModel.findOne.mockResolvedValue(null);

      await temaService.findByName('TEMA PREMIUM').catch(() => {});

      expect(mockModel.findOne).toHaveBeenCalledWith({
        where: { tem_nome: 'TEMA PREMIUM' },
      });
    });
  });

  describe('cloneTheme', () => {
    it('deve clonar tema com data no nome', async () => {
      const mockTema = { id: 1, tem_par_id: 5, tem_nome: 'Original' };
      const clonedTema = { id: 2, tem_par_id: 5 };

      jest.spyOn(temaService, 'findById').mockResolvedValue(mockTema);
      jest.spyOn(temaService, 'create').mockResolvedValue(clonedTema);

      const result = await temaService.cloneTheme(1, 'Cópia');

      expect(temaService.findById).toHaveBeenCalledWith(1);
      expect(temaService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tem_par_id: 5,
          tem_nome: expect.stringContaining('Cópia'),
        }),
      );
      expect(result).toEqual(clonedTema);
    });

    it('deve usar data formatada brasileira no nome clonado', async () => {
      const mockTema = { id: 1, tem_par_id: 1, tem_nome: 'Original' };
      jest.spyOn(temaService, 'findById').mockResolvedValue(mockTema);
      jest.spyOn(temaService, 'create').mockResolvedValue({ id: 2 });

      jest.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue('01/12/2024');

      await temaService.cloneTheme(1, 'Cópia');

      expect(temaService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tem_nome: 'Cópia (01/12/2024)',
        }),
      );
    });
  });

  describe('Métodos herdados de BaseService', () => {
    it('findAll deve estar disponível', () => {
      expect(typeof temaService.findAll).toBe('function');
    });

    it('findById deve estar disponível', () => {
      expect(typeof temaService.findById).toBe('function');
    });

    it('create deve estar disponível', () => {
      expect(typeof temaService.create).toBe('function');
    });

    it('update deve estar disponível', () => {
      expect(typeof temaService.update).toBe('function');
    });

    it('delete deve estar disponível', () => {
      expect(typeof temaService.delete).toBe('function');
    });
  });
});
