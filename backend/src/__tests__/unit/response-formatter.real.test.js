import { ResponseFormatter } from '../../utils/ResponseFormatter.js';

describe('ResponseFormatter - Real Coverage', () => {
  it('success deve retornar objeto de sucesso', () => {
    const data = { foo: 'bar' };
    const result = ResponseFormatter.success(data);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(data);
    expect(result).toHaveProperty('timestamp');
  });

  it('error deve retornar objeto de erro', () => {
    const result = ResponseFormatter.error('Falha', 400);
    expect(result.success).toBe(false);
    expect(result.error.message).toBe('Falha');
    expect(result.error.statusCode).toBe(400);
    expect(result.error).toHaveProperty('timestamp');
  });

  it('notFound deve retornar erro 404', () => {
    const result = ResponseFormatter.notFound('RecursoX');
    expect(result.success).toBe(false);
    expect(result.error.statusCode).toBe(404);
    expect(result.error.message).toContain('RecursoX');
  });
});
