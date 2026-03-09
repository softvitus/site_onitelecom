/**
 * @module utils/QueryBuilder
 * @description Helper para construir queries complexas do Sequelize
 */

import { Op } from 'sequelize';

export class QueryBuilder {
  constructor(model) {
    this.model = model;
    this.query = {
      where: {},
      include: [],
      order: [],
      limit: 10,
      offset: 0,
    };
  }

  /**
   * Adiciona filtros WHERE
   */
  where(conditions) {
    this.query.where = { ...this.query.where, ...conditions };
    return this;
  }

  /**
   * Adiciona filtros com operadores Sequelize
   */
  whereOp(field, operator, value) {
    const operators = {
      eq: Op.eq,
      ne: Op.ne,
      gt: Op.gt,
      gte: Op.gte,
      lt: Op.lt,
      lte: Op.lte,
      like: Op.like,
      in: Op.in,
      between: Op.between,
    };

    if (!operators[operator]) {
      throw new Error(`Operador desconhecido: ${operator}`);
    }

    this.query.where[field] = { [operators[operator]]: value };
    return this;
  }

  /**
   * Busca por texto (LIKE)
   */
  search(fields, term) {
    const conditions = fields.map((field) => ({
      [field]: { [Op.like]: `%${term}%` },
    }));

    this.query.where = { ...this.query.where, [Op.or]: conditions };
    return this;
  }

  /**
   * Adiciona includes (relacionamentos)
   */
  include(association, nested = null) {
    const include = {
      association,
      required: false,
    };

    if (nested) {
      include.include = Array.isArray(nested) ? nested : [nested];
    }

    this.query.include.push(include);
    return this;
  }

  /**
   * Adiciona ordenação
   */
  order(field, direction = 'ASC') {
    this.query.order.push([field, direction]);
    return this;
  }

  /**
   * Define limite e offset (paginação)
   */
  paginate(page = 1, limit = 10) {
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.max(1, Math.min(100, parseInt(limit) || 10));

    this.query.limit = limit;
    this.query.offset = (page - 1) * limit;

    return this;
  }

  /**
   * Limita campos retornados
   */
  select(fields) {
    this.query.attributes = fields;
    return this;
  }

  /**
   * Exclui campos
   */
  exclude(fields) {
    this.query.attributes = { exclude: fields };
    return this;
  }

  /**
   * Adiciona raw query
   */
  raw(value = true) {
    this.query.raw = value;
    return this;
  }

  /**
   * Retorna a query construída
   */
  build() {
    return this.query;
  }

  /**
   * Executa findAll
   */
  async all() {
    return this.model.findAll(this.query);
  }

  /**
   * Executa findAndCountAll (com total)
   */
  async paginated() {
    return this.model.findAndCountAll(this.query);
  }

  /**
   * Executa findOne
   */
  async one() {
    return this.model.findOne(this.query);
  }

  /**
   * Executa count
   */
  async count() {
    const queryWithoutLimit = { ...this.query };
    delete queryWithoutLimit.limit;
    delete queryWithoutLimit.offset;

    return this.model.count(queryWithoutLimit);
  }

  /**
   * Retorna a query em string SQL (para debug)
   */
  toSQL() {
    return this.model.sequelize
      .getQueryInterface()
      .queryGenerator.selectQuery(this.model.tableName, this.query);
  }
}

export default QueryBuilder;
