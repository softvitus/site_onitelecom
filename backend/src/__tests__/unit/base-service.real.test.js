import { BaseService } from '../../services/BaseService.js';

const fakeModel = {
  name: 'Item', // Adicionar nome do modelo para mensagens de erro
  findAll: async () => [{ id: '1', nome: 'Item 1' }],
  findOne: async () => ({ id: '1', nome: 'Item 1' }),
  findByPk: async (id) => id === '1' ? { id: '1', nome: 'Item 1' } : null,
  create: async (data) => ({ id: '2', ...data }),
  update: async () => [1],
  destroy: async () => 1,
  count: async () => 1,
};

describe('BaseService - Real Coverage', () => {
  let service;
  beforeEach(() => {
    service = new BaseService(fakeModel);
  });

  it('BaseService deve ser instanciável', () => {
    expect(service).toBeInstanceOf(BaseService);
  });

  it('findById() deve retornar item por ID', async () => {
    const result = await service.findById('1');
    expect(result).toBeDefined();
    expect(result.id).toBe('1');
  });

  it('create() deve criar novo item', async () => {
    const item = await service.create({ nome: 'Novo' });
    expect(item.id).toBe('2');
    expect(item.nome).toBe('Novo');
  });
});
