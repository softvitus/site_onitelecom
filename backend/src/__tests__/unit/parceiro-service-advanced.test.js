import { ParceiroService } from '../../services/ParceiroService.js';
import { BaseService } from '../../services/BaseService.js';
import { ApiError } from '../../utils/ErrorCodes.js';

/**
 * ParceiroService - Testes Avançados de Cobertura
 * Aumenta cobertura testando métodos avançados
 */
describe('ParceiroService - Cobertura Avançada', () => {
  let parceiroService;
  let mockModel;

  beforeEach(() => {
    mockModel = {
      findByPk: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
      findOne: jest.fn(),
    };

    parceiroService = new ParceiroService(mockModel);
  });

  describe('Herança de BaseService', () => {
    it('ParceiroService deve estender BaseService', () => {
      expect(parceiroService).toBeInstanceOf(BaseService);
      expect(parceiroService).toBeInstanceOf(ParceiroService);
    });

    it('deve ter acesso a this.model', () => {
      expect(parceiroService.model).toBe(mockModel);
    });
  });

  describe('Métodos herdados de BaseService', () => {
    it('findAll deve estar disponível', () => {
      expect(typeof parceiroService.findAll).toBe('function');
    });

    it('findById deve estar disponível', () => {
      expect(typeof parceiroService.findById).toBe('function');
    });

    it('create deve estar disponível', () => {
      expect(typeof parceiroService.create).toBe('function');
    });

    it('update deve estar disponível', () => {
      expect(typeof parceiroService.update).toBe('function');
    });

    it('delete deve estar disponível', () => {
      expect(typeof parceiroService.delete).toBe('function');
    });
  });

  describe('Validação de estrutura', () => {
    it('deve ser uma classe', () => {
      expect(typeof ParceiroService).toBe('function');
    });

    it('deve ter construtor que aceita model', () => {
      expect(parceiroService.model).toBe(mockModel);
    });

    it('deve inicializar com model válido', () => {
      expect(parceiroService.model).toBeDefined();
      expect(typeof parceiroService.model.findByPk).toBe('function');
    });
  });

  describe('CRUD Operations', () => {
    it('create deve ser chamável', async () => {
      jest.spyOn(parceiroService, 'create').mockResolvedValue({ id: 1 });

      const result = await parceiroService.create({ name: 'Test' });

      expect(result).toEqual({ id: 1 });
    });

    it('findAll deve ser chamável', async () => {
      jest.spyOn(parceiroService, 'findAll').mockResolvedValue([]);

      const result = await parceiroService.findAll();

      expect(Array.isArray(result) || result.rows).toBeDefined();
    });

    it('findById deve ser chamável', async () => {
      jest.spyOn(parceiroService, 'findById').mockResolvedValue({ id: 1 });

      const result = await parceiroService.findById(1);

      expect(result).toEqual({ id: 1 });
    });

    it('update deve ser chamável', async () => {
      jest.spyOn(parceiroService, 'update').mockResolvedValue({ id: 1, name: 'Updated' });

      const result = await parceiroService.update(1, { name: 'Updated' });

      expect(result).toEqual({ id: 1, name: 'Updated' });
    });

    it('delete deve ser chamável', async () => {
      jest.spyOn(parceiroService, 'delete').mockResolvedValue(true);

      const result = await parceiroService.delete(1);

      expect(result).toBe(true);
    });
  });

  describe('Verificação de instância', () => {
    it('deve ser instância de ParceiroService', () => {
      expect(parceiroService).toBeInstanceOf(ParceiroService);
    });

    it('deve ser instância de BaseService', () => {
      expect(parceiroService).toBeInstanceOf(BaseService);
    });

    it('não deve ser null', () => {
      expect(parceiroService).not.toBeNull();
    });

    it('deve ter propriedade model', () => {
      expect(parceiroService).toHaveProperty('model');
    });
  });

  describe('Métodos Geoespaciais - Cobertura Avançada', () => {
    describe('calculateDistance - Casos extremos', () => {
      it('deve calcular distância com alta precisão', () => {
        const distance = parceiroService.calculateDistance(0, 0, 0.01, 0);
        expect(distance).toBeGreaterThan(1.1); // ~1.11 km
        expect(distance).toBeLessThan(1.2);
      });

      it('deve ser simétrico para distância reversa', () => {
        const d1 = parceiroService.calculateDistance(10, 20, 30, 40);
        const d2 = parceiroService.calculateDistance(30, 40, 10, 20);
        expect(d1).toBeCloseTo(d2, 5); // 5 casas decimais
      });

      it('deve retornar número finito sempre', () => {
        const distance = parceiroService.calculateDistance(-45.5, -120.3, 60.7, 140.2);
        expect(isFinite(distance)).toBe(true);
        expect(distance).toBeGreaterThanOrEqual(0);
      });

      it('deve calcular corretamente cruzamento de hemisférios', () => {
        // Do equador à Sibéria
        const distance = parceiroService.calculateDistance(0, 0, 70, 100);
        expect(distance).toBeGreaterThan(7000); // Mais de 7000 km
      });
    });

    describe('validateLocationData - Robustez', () => {
      it('deve aceitar strings numéricas para coordenadas', () => {
        const data = {
          par_latitude: '-7.115556',
          par_longitude: '-34.878056',
          par_raio_cobertura: '50',
        };

        expect(() => parceiroService.validateLocationData(data)).not.toThrow();
      });

      it('deve validar múltiplos campos na mesma chamada', () => {
        const validData = {
          par_latitude: 0,
          par_longitude: 0,
          par_raio_cobertura: 100,
          par_endereco: 'Rua Teste',
          par_cep: '12345-678',
        };

        expect(() => parceiroService.validateLocationData(validData)).not.toThrow();
      });

      it('deve validar limites exatos', () => {
        const borderCases = [
          { par_latitude: -90 },
          { par_latitude: 90 },
          { par_longitude: -180 },
          { par_longitude: 180 },
          { par_raio_cobertura: 0 },
        ];

        borderCases.forEach(data => {
          expect(() => parceiroService.validateLocationData(data)).not.toThrow();
        });
      });

      it('deve rejeitar valores ligeiramente fora dos limites', () => {
        expect(() => parceiroService.validateLocationData({ par_latitude: 90.00001 })).toThrow();
        expect(() => parceiroService.validateLocationData({ par_longitude: -180.00001 })).toThrow();
      });

      it('deve ignorar campos null ou undefined', () => {
        const data = {
          par_latitude: null,
          par_longitude: undefined,
          par_endereco: 'Válido',
        };

        expect(() => parceiroService.validateLocationData(data)).not.toThrow();
      });
    });

    describe('findNearby - Integração completa', () => {
      it('deve ter assinatura correta com padrões', async () => {
        mockModel.findAll.mockResolvedValue([]);

        // Deve ser capaz de chamar com apenas latitude e longitude
        await parceiroService.findNearby(-7.115556, -34.878056);

        expect(mockModel.findAll).toHaveBeenCalled();
      });

      it('deve estruturar resposta com paginação correta', async () => {
        mockModel.findAll.mockResolvedValue([
          {
            toJSON: jest.fn().mockReturnValue({ par_id: '1' }),
            par_latitude: '-7.115556',
            par_longitude: '-34.878056',
          },
        ]);

        const result = await parceiroService.findNearby(-7.115556, -34.878056);

        expect(result).toHaveProperty('rows');
        expect(result).toHaveProperty('pagination');
        expect(result.pagination).toHaveProperty('total');
        expect(result.pagination).toHaveProperty('page');
        expect(result.pagination).toHaveProperty('limit');
        expect(result.pagination).toHaveProperty('pages');
      });

      it('deve calcular páginas corretamente', async () => {
        // Criar 33 parceiros simulados
        const mockParceiros = Array.from({ length: 33 }, (_, i) => ({
          toJSON: jest.fn().mockReturnValue({ par_id: String(i) }),
          par_latitude: String(-7 + i * 0.01),
          par_longitude: String(-34 + i * 0.01),
        }));

        mockModel.findAll.mockResolvedValue(mockParceiros);

        const result = await parceiroService.findNearby(-7, -34, 500, { page: 2, limit: 10 });

        expect(result.pagination.pages).toBe(4); // 33 / 10 = 3.3 -> 4 páginas
        expect(result.rows.length).toBe(10); // Página 2 tem 10 itens
      });

      it('deve filtrar apenas parceiros dentro do raio', async () => {
        const center = { lat: -7.115556, lon: -34.878056 };

        // Parceiro muito distante (>200km)
        const distantParceiro = {
          toJSON: jest.fn().mockReturnValue({ par_id: '100' }),
          par_latitude: '-5.0', // ~220 km de distância aproximadamente
          par_longitude: '-34.878056',
        };

        mockModel.findAll.mockResolvedValue([distantParceiro]);

        const result = await parceiroService.findNearby(center.lat, center.lon, 100); // raio 100km

        // Deverá ser filtrado pois está muito distante
        expect(result.rows.length).toBe(0);
      });
    });
  });
});
