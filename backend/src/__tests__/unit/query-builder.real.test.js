import { QueryBuilder } from '../../utils/QueryBuilder.js';

describe('QueryBuilder - Real Coverage', () => {
  it('QueryBuilder deve ser instanciável', () => {
    const builder = new QueryBuilder();
    expect(builder).toBeInstanceOf(QueryBuilder);
  });

  it('build() deve retornar objeto com where e include', () => {
    const builder = new QueryBuilder();
    const query = builder.build();
    expect(query).toHaveProperty('where');
    expect(query).toHaveProperty('include');
    expect(query).toHaveProperty('order');
  });

  it('where() deve adicionar filtros', () => {
    const builder = new QueryBuilder();
    builder.where({ status: 'ativo' });
    const query = builder.build();
    expect(query.where).toHaveProperty('status', 'ativo');
  });

  it('where() com múltiplos filtros', () => {
    const builder = new QueryBuilder();
    builder.where({ status: 'ativo' }).where({ type: 'admin' });
    const query = builder.build();
    expect(query.where.status).toBe('ativo');
    expect(query.where.type).toBe('admin');
  });

  it('paginate() deve configurar paginação corretamente', () => {
    const builder = new QueryBuilder();
    builder.paginate(2, 20);
    const query = builder.build();
    expect(query).toHaveProperty('offset');
    expect(query).toHaveProperty('limit', 20);
    expect(query.offset).toBe(20); // page 2, limit 20 = offset 20
  });

  it('paginate() com filtros simultâneos', () => {
    const builder = new QueryBuilder();
    builder.where({ status: 'ativo' }).paginate(1, 15);
    const query = builder.build();
    expect(query.where).toHaveProperty('status');
    expect(query.limit).toBe(15);
  });

  it('include() deve adicionar associações', () => {
    const builder = new QueryBuilder();
    builder.include('relacionamento');
    const query = builder.build();
    expect(query.include.length).toBeGreaterThan(0);
  });

  it('order() deve adicionar ordenação', () => {
    const builder = new QueryBuilder();
    builder.order('name', 'ASC');
    const query = builder.build();
    expect(query.order.length).toBeGreaterThan(0);
  });

  it('chain: where -> include -> order -> paginate', () => {
    const builder = new QueryBuilder();
    const query = builder
      .where({ status: 'active' })
      .include('users')
      .order('createdAt', 'DESC')
      .paginate(1, 50)
      .build();

    expect(query.where.status).toBe('active');
    expect(query.include.length).toBe(1);
    expect(query.order.length).toBe(1);
    expect(query.limit).toBe(50);
  });
});
