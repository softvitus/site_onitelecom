/**
 * Pagination Helper
 * Utilitários para paginação
 */

export class PaginationHelper {
  /**
   * Calcula offset e limit a partir de page e limit
   */
  static calculateOffset(page = 1, limit = 10) {
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.max(1, Math.min(100, parseInt(limit) || 10)); // Max 100 por página

    const offset = (page - 1) * limit;

    return { page, limit, offset };
  }

  /**
   * Cria objeto de paginação
   */
  static createPagination(page, limit, total) {
    return {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
      hasMore: page * limit < total,
      hasPrevious: page > 1,
    };
  }

  /**
   * Middleware que injeta paginação automática
   */
  static middleware() {
    return (req, res, next) => {
      const { page = 1, limit = 10, sort = '-createdAt', search = '' } = req.query;

      req.pagination = PaginationHelper.calculateOffset(page, limit);
      req.sort = PaginationHelper.parseSort(sort);
      req.search = search;

      next();
    };
  }

  /**
   * Parse do parâmetro sort
   * Formato: field ou -field para descendente
   */
  static parseSort(sortStr) {
    if (!sortStr) return [['createdAt', 'DESC']];

    const sorts = sortStr.split(',').map((s) => {
      s = s.trim();
      if (s.startsWith('-')) {
        return [s.substring(1), 'DESC'];
      }
      return [s, 'ASC'];
    });

    return sorts;
  }

  /**
   * Gera links de paginação (para HATEOAS)
   */
  static generateLinks(basePath, page, limit, total) {
    const links = {
      self: `${basePath}?page=${page}&limit=${limit}`,
      first: `${basePath}?page=1&limit=${limit}`,
      last: `${basePath}?page=${Math.ceil(total / limit)}&limit=${limit}`,
    };

    if (page > 1) {
      links.prev = `${basePath}?page=${page - 1}&limit=${limit}`;
    }

    if (page * limit < total) {
      links.next = `${basePath}?page=${page + 1}&limit=${limit}`;
    }

    return links;
  }

  /**
   * Valida parâmetros de paginação
   */
  static validate(page, limit) {
    const errors = [];

    if (isNaN(page) || page < 1) {
      errors.push({ field: 'page', message: 'page deve ser um número >= 1' });
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      errors.push({ field: 'limit', message: 'limit deve estar entre 1 e 100' });
    }

    return errors;
  }
}

export default PaginationHelper;
