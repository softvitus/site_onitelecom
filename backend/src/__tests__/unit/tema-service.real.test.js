import { TemaService } from '../../services/TemaService.js';
import { ApiError } from '../../utils/ErrorCodes.js';

// Mock mínimo de model Sequelize para integração real
const fakeTemaModel = {
  name: 'Tema', // Adicionar nome do modelo
  findAll: async () => [{ tem_id: '1', tem_nome: 'Tema Teste', tem_par_id: 'p1' }],
  findOne: async ({ where }) => where.tem_nome === 'Tema Teste' ? { tem_id: '1', tem_nome: 'Tema Teste', tem_par_id: 'p1' } : null,
  findByPk: async (id) => id === '1' ? { tem_id: '1', tem_nome: 'Tema Teste', tem_par_id: 'p1' } : null,
  create: async (data) => ({ tem_id: '2', ...data }),
  update: async () => [1],
  destroy: async () => 1,
  count: async () => 1,
};

describe('TemaService - Real Coverage', () => {
  let service;
  beforeEach(() => {
    service = new TemaService(fakeTemaModel);
  });

  it('findByName deve retornar tema correto', async () => {
    const tema = await service.findByName('Tema Teste');
    expect(tema.tem_nome).toBe('Tema Teste');
  });

  it('findByName deve lançar ApiError se não encontrar', async () => {
    await expect(service.findByName('Inexistente')).rejects.toThrow(ApiError);
  });

  it('create deve criar novo tema', async () => {
    const tema = await service.create({ tem_nome: 'Novo', tem_par_id: 'p1' });
    expect(tema.tem_id).toBeDefined();
    expect(tema.tem_nome).toBe('Novo');
  });
});
