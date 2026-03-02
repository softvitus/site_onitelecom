/**
 * @module services/HealthCheckService
 * @description Serviço de verificação de saúde da aplicação
 */

import sequelize from '../config/sequelize.js';

/**
 * Serviço de Health Check (métodos estáticos)
 */
export class HealthCheckService {
  /**
   * Verifica status geral da aplicação
   * @returns {Promise<Object>} Status da aplicação com componentes
   */
  static async getApplicationHealth() {
    const databaseHealth = await this.checkDatabase();

    return {
      status: databaseHealth.status === 'ok' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.API_VERSION || 'v1',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      components: {
        database: databaseHealth,
        api: {
          status: 'ok',
          message: 'API is running',
        },
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB',
      },
    };
  }

  /**
   * Verifica conexão com o banco de dados
   * @returns {Promise<Object>} Status da conexão
   */
  static async checkDatabase() {
    try {
      const startTime = Date.now();
      await sequelize.authenticate();
      const responseTime = Date.now() - startTime;

      return {
        status: 'ok',
        message: 'Database connection successful',
        responseTime: `${responseTime}ms`,
        database: sequelize.options.database,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Database connection failed',
        error: error.message,
      };
    }
  }

  /**
   * Verifica status de prontidão (readiness probe para k8s)
   * @returns {Promise<Object>} Status de prontidão
   */
  static async getReadinessProbe() {
    const health = await this.getApplicationHealth();
    const isReady =
      health.status === 'healthy' &&
      health.components.database.status === 'ok' &&
      health.components.api.status === 'ok';

    return {
      ready: isReady,
      checks: {
        database: health.components.database.status === 'ok',
        api: health.components.api.status === 'ok',
      },
    };
  }

  /**
   * Verifica status de vida (liveness probe para k8s)
   * @returns {Object} Status de vida
   */
  static getLivenessProbe() {
    return {
      alive: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}

export default HealthCheckService;