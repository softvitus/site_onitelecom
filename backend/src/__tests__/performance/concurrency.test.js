/**
 * Concurrency Tests - Simultaneous Requests
 * Valida comportamento sob múltiplas requisições simultâneas
 */

import { ParceiroService } from '../../services/ParceiroService.js';
import { TemaService } from '../../services/TemaService.js';

// Mock Sequelize
jest.mock('sequelize', () => ({
  ...jest.requireActual('sequelize'),
  DataTypes: {
    INTEGER: 'INTEGER',
    STRING: 'STRING',
    TEXT: 'TEXT',
    BOOLEAN: 'BOOLEAN',
    DATE: 'DATE',
    JSON: 'JSON',
  },
}));

describe('Concurrency - Simultaneous Requests', () => {
  let parceiroService;
  let temaService;

  beforeEach(() => {
    const mockModel = {
      findAndCountAll: jest.fn().mockResolvedValue({
        rows: [{ id: '1', name: 'Test' }],
        count: 1,
      }),
      findByPk: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }),
      create: jest.fn().mockImplementation((data) =>
        Promise.resolve({ id: Math.random(), ...data })
      ),
      update: jest.fn().mockResolvedValue([1]),
      destroy: jest.fn().mockResolvedValue(1),
      increment: jest.fn().mockResolvedValue([1]),
      name: 'TestModel',
    };

    parceiroService = new ParceiroService(mockModel);
    temaService = new TemaService(mockModel);
  });

  describe('Multiple Simultaneous Reads', () => {
    it('deve suportar 10 leituras simultâneas', async () => {
      const promises = Array(10)
        .fill(null)
        .map(() => parceiroService.findAll({}, { page: 1, limit: 10 }));

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      expect(parceiroService.model.findAndCountAll).toHaveBeenCalledTimes(10);
    });

    it('deve suportar 50 leituras simultâneas', async () => {
      const promises = Array(50)
        .fill(null)
        .map((_, i) => parceiroService.findById(`${i}`));

      const results = await Promise.all(promises);

      expect(results).toHaveLength(50);
      expect(parceiroService.model.findByPk).toHaveBeenCalledTimes(50);
    });

    it('deve manter consistência de dados com múltiplas leituras', async () => {
      const promises = Array(20)
        .fill(null)
        .map(() => parceiroService.findAll({}, { page: 1, limit: 10 }));

      const results = await Promise.all(promises);

      // Todos os resultados devem ser idênticos
      const firstResult = results[0];
      results.forEach((result) => {
        expect(result.total).toBe(firstResult.total);
        expect(result.data).toEqual(firstResult.data);
      });
    });
  });

  describe('Multiple Simultaneous Writes', () => {
    it('deve suportar 10 criações simultâneas', async () => {
      const promises = Array(10)
        .fill(null)
        .map((_, i) => parceiroService.create({ name: `Name ${i}` }));

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      expect(parceiroService.model.create).toHaveBeenCalledTimes(10);
    });

    it('cada criação deve receber ID único', async () => {
      const promises = Array(10)
        .fill(null)
        .map((_, i) => parceiroService.create({ name: `Name ${i}` }));

      const results = await Promise.all(promises);

      const ids = results.map((r) => r.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(10); // Todos os IDs devem ser únicos
    });
  });

  describe('Mixed Read/Write Operations', () => {
    it('deve manter integridade com leituras e escritas', async () => {
      const operations = [];

      // Intercalar reads e writes
      for (let i = 0; i < 5; i++) {
        operations.push(parceiroService.findAll({}, { page: 1, limit: 10 }));
        operations.push(parceiroService.create({ name: `Item ${i}` }));
        operations.push(parceiroService.findById(`${i}`));
      }

      const results = await Promise.all(operations);

      expect(results).toHaveLength(15);
      expect(results.every((r) => r !== undefined)).toBe(true);
    });
  });

  describe('Performance Under Load', () => {
    it('deve manter tempo de resposta com 100 requisições simultâneas', async () => {
      const start = performance.now();

      const promises = Array(100)
        .fill(null)
        .map(() => parceiroService.findAll({}, { page: 1, limit: 10 }));

      await Promise.all(promises);
      const duration = performance.now() - start;

      // 100 requisições em menos de 500ms (5ms média)
      expect(duration).toBeLessThan(500);
    });

    it('deve recuperar de picos de tráfego', async () => {
      const timings = [];

      // 3 ondas de requisições
      for (let wave = 0; wave < 3; wave++) {
        const start = performance.now();
        const promises = Array(50)
          .fill(null)
          .map(() => parceiroService.findAll({}, { page: 1, limit: 10 }));
        await Promise.all(promises);
        timings.push(performance.now() - start);
      }

      // Todas as ondas devem ter timing similar (performance consistente)
      const avgTiming = timings.reduce((a, b) => a + b) / timings.length;
      timings.forEach((timing) => {
        // Tolerância de 100% para ambientes com variação de carga
        expect(Math.abs(timing - avgTiming)).toBeLessThan(avgTiming * 1.0);
      });
    });
  });

  describe('Error Handling Under Concurrency', () => {
    it('deve continuar processando requisições quando uma falha', async () => {
      // Simular cenário onde alguns findByPk falham
      parceiroService.model.findByPk.mockRejectedValueOnce(new Error('DB Error'));

      const promises = [
        parceiroService.create({ name: 'Test1' }),
        parceiroService.findById('invalid').catch(() => null),
        parceiroService.create({ name: 'Test2' }),
      ];

      const results = await Promise.all(promises);

      // Requisições bem-sucedidas continuam funcionando
      expect(results[0]).toBeDefined();
      expect(results[2]).toBeDefined();
    });
  });
});
