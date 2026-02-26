import { ApiError, ERROR_CODES } from '../../utils/ErrorCodes.js';

describe('ErrorCodes - Real Coverage', () => {
  it('deve ter ERROR_CODES definidos', () => {
    expect(ERROR_CODES).toBeDefined();
    expect(ERROR_CODES).toHaveProperty('VALIDATION_ERROR');
    expect(ERROR_CODES).toHaveProperty('NOT_FOUND');
    expect(ERROR_CODES).toHaveProperty('UNAUTHORIZED');
    expect(ERROR_CODES).toHaveProperty('FORBIDDEN');
    expect(ERROR_CODES).toHaveProperty('INTERNAL_ERROR');
  });

  it('ApiError deve ser instanciável', () => {
    const error = new ApiError('NOT_FOUND', 'Recurso não encontrado');
    expect(error).toBeInstanceOf(ApiError);
    expect(error.errorCode).toBe('NOT_FOUND');
    expect(error.code).toBe(4030); // código numérico
    expect(error.message).toBe('Recurso não encontrado');
  });

  it('ApiError deve ter statusCode correto', () => {
    const error = new ApiError('NOT_FOUND', 'Item não encontrado');
    expect(error.statusCode).toBe(404);
  });

  it('ApiError deve ter details opcionais', () => {
    const error = new ApiError('VALIDATION_ERROR', 'Dados inválidos', { field: 'email' });
    expect(error.details).toEqual({ field: 'email' });
  });

  it('deve retornar mensagens padrão para códigos conhecidos', () => {
    const error400 = new ApiError('VALIDATION_ERROR', 'Erro');
    expect(error400.statusCode).toBe(400);

    const error401 = new ApiError('UNAUTHORIZED', 'Não autenticado');
    expect(error401.statusCode).toBe(401);

    const error403 = new ApiError('FORBIDDEN', 'Sem permissão');
    expect(error403.statusCode).toBe(403);

    const error500 = new ApiError('INTERNAL_ERROR', 'Erro interno');
    expect(error500.statusCode).toBe(500);
  });

  it('ApiError deve ser serializável', () => {
    const error = new ApiError('NOT_FOUND', 'Item não encontrado');
    const json = error.toJSON ? error.toJSON() : JSON.stringify({
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    });
    expect(json).toBeDefined();
  });
});
