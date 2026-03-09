/**
 * @module utils/CacheManager
 * @description Sistema de cache em memória com expiração
 */

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Define um valor no cache
   * @param {string} key - Chave
   * @param {*} value - Valor
   * @param {number} ttl - Time to live em segundos
   */
  set(key, value, ttl = 300) {
    // Remove timer anterior se existir
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Armazena o valor
    this.cache.set(key, {
      value,
      createdAt: Date.now(),
      ttl,
    });

    // Define expiração automática
    if (ttl > 0) {
      const timer = setTimeout(() => this.delete(key), ttl * 1000);
      this.timers.set(key, timer);
    }

    // eslint-disable-next-line no-console
    console.log(`[CACHE] Set: ${key} (TTL: ${ttl}s)`);
  }

  /**
   * Obtém um valor do cache
   * @param {string} key - Chave
   */
  get(key) {
    const cached = this.cache.get(key);

    if (!cached) {
      // eslint-disable-next-line no-console
      console.log(`[CACHE] Miss: ${key}`);
      return null;
    }

    // eslint-disable-next-line no-console
    console.log(`[CACHE] Hit: ${key}`);
    return cached.value;
  }

  /**
   * Verifica se uma chave existe e ainda é válida
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Deleta uma chave do cache
   */
  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }

    const deleted = this.cache.delete(key);
    if (deleted) {
      // eslint-disable-next-line no-console
      console.log(`[CACHE] Deleted: ${key}`);
    }
    return deleted;
  }

  /**
   * Limpa todo o cache
   */
  clear() {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.cache.clear();
    this.timers.clear();
    // eslint-disable-next-line no-console
    console.log('[CACHE] Cleared');
  }

  /**
   * Retorna estatísticas do cache
   */
  stats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memory: `${(JSON.stringify(Array.from(this.cache.entries())).length / 1024).toFixed(2)} KB`,
    };
  }

  /**
   * Middleware para cache baseado em requisição
   * @param {number} ttl - Time to live em segundos
   * @returns {Function} Express middleware
   */
  middleware(ttl = 300) {
    const cacheInstance = this;

    return (req, res, next) => {
      // Apenas cache para GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const cacheKey = `${req.path}:${JSON.stringify(req.query)}`;
      const cached = cacheInstance.get(cacheKey);

      if (cached) {
        return res.json({ ...cached, _cached: true });
      }

      // Intercepta res.json para cachear
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        if (res.statusCode === 200 && data.success) {
          cacheInstance.set(cacheKey, data, ttl);
        }
        return originalJson(data);
      };

      next();
    };
  }

  /**
   * Decorator para cachear resultado de funções
   */
  static decorator(ttl = 300) {
    return (target, propertyKey, descriptor) => {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args) {
        const cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;
        const cached = CacheManager.instance.get(cacheKey);

        if (cached) {
          return cached;
        }

        const result = await originalMethod.apply(this, args);
        CacheManager.instance.set(cacheKey, result, ttl);
        return result;
      };

      return descriptor;
    };
  }
}

// Singleton instance
CacheManager.instance = new CacheManager();

export default CacheManager;
export const cache = CacheManager.instance;
