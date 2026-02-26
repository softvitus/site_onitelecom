/**
 * Response Formatter
 * Padroniza respostas da API
 */

export class ResponseFormatter {
  /**
   * Resposta de sucesso
   */
  static success(data = null, message = 'Operação realizada com sucesso', pagination = null) {
    const response = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    if (pagination) {
      response.pagination = pagination;
    }

    return response;
  }

  /**
   * Resposta de erro
   */
  static error(message, statusCode = 400, details = null) {
    const response = {
      success: false,
      error: {
        message,
        statusCode,
        timestamp: new Date().toISOString(),
      },
    };

    if (details) {
      response.error.details = details;
    }

    return response;
  }

  /**
   * Resposta paginada
   */
  static paginated(data, total, page, limit) {
    return {
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Resposta vazia (resource não encontrado)
   */
  static notFound(resource = 'Recurso') {
    return {
      success: false,
      error: {
        message: `${resource} não encontrado`,
        statusCode: 404,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Resposta de validação
   */
  static validation(errors) {
    return {
      success: false,
      error: {
        message: 'Validação falhou',
        statusCode: 400,
        details: errors,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Resposta de operação em lote
   */
  static batch(successful = [], failed = [], skipped = []) {
    return {
      success: failed.length === 0,
      results: {
        successful: successful.length,
        failed: failed.length,
        skipped: skipped.length,
      },
      data: {
        successful,
        failed,
        skipped,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Middleware que injeta formatter nas respostas
   */
  static middleware() {
    return (req, res, next) => {
      res.success = (data, message, pagination) => {
        res.json(ResponseFormatter.success(data, message, pagination));
      };

      res.error = (message, statusCode = 400, details) => {
        res.status(statusCode).json(ResponseFormatter.error(message, statusCode, details));
      };

      res.paginated = (data, total, page, limit) => {
        res.json(ResponseFormatter.paginated(data, total, page, limit));
      };

      res.notFound = (resource) => {
        res.status(404).json(ResponseFormatter.notFound(resource));
      };

      next();
    };
  }
}

export default ResponseFormatter;
