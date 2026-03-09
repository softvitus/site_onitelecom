/**
 * @module middleware/logging
 * @description Middleware de logging - registra informações sobre requisições
 */

/**
 * Logger básico de requisições
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Armazena método original de res.json para interceptar resposta
  const originalJson = res.json;
  res.json = function (data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const isError = statusCode >= 400;

    const logLevel = isError ? 'ERROR' : 'INFO';
    const color = isError ? '\x1b[31m' : '\x1b[32m';
    const reset = '\x1b[0m';

    if (process.env.REQUEST_LOGGING !== 'false') {
      // eslint-disable-next-line no-console
      console.log(
        `${color}[${logLevel}]${reset} ${req.method} ${req.path} - ${statusCode} - ${duration}ms`,
      );
    }

    if (process.env.VERBOSE_LOGGING === 'true') {
      // eslint-disable-next-line no-console
      console.log('  Body:', req.body);
      // eslint-disable-next-line no-console
      console.log('  Query:', req.query);
    }

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Logger de performance
 */
export const performanceLogger = (req, res, next) => {
  const startTime = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(startTime);
    const ms = (diff[0] * 1000 + diff[1] / 1000000).toFixed(2);

    if (ms > 1000 && process.env.PERFORMANCE_LOGGING !== 'false') {
      // eslint-disable-next-line no-console
      console.warn(
        `[PERFORMANCE] ${req.method} ${req.path} levou ${ms}ms (lento!)`,
      );
    }
  });

  next();
};

/**
 * Logger de requisições e respostas detalhado
 */
export const detailedLogger = (req, res, next) => {
  const requestId = generateRequestId();

  req.id = requestId;

  if (process.env.DETAILED_LOGGING === 'true') {
    // eslint-disable-next-line no-console
    console.log(`
[REQUEST] ${requestId}
  Method: ${req.method}
  Path: ${req.path}
  IP: ${req.ip || req.connection.remoteAddress}
  User Agent: ${req.get('user-agent')}
  Timestamp: ${new Date().toISOString()}
  `);
  }

  next();
};

/**
 * Gera um ID único para rastreamento de requisição
 */
function generateRequestId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Logger de banco de dados (Sequelize)
 */
export const databaseLogger = (sequelize) => {
  if (process.env.DB_LOGGING !== 'false') {
    sequelize.addHook('beforeConnect', (_config) => {
      // eslint-disable-next-line no-console
      console.log('[DB] Conectando ao banco de dados...');
    });

    sequelize.addHook('afterConnect', () => {
      // eslint-disable-next-line no-console
      console.log('[DB] ✓ Conectado ao banco de dados');
    });
  }

  if (process.env.VERBOSE_LOGGING === 'true') {
    // eslint-disable-next-line no-console
    sequelize.options.logging = (sql) => console.log('[SQL]', sql);
  } else {
    sequelize.options.logging = false;
  }
};

/**
 * Logger com colorização para API status
 */
export const coloredStatusLogger = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    const statusCode = res.statusCode;
    let statusColor;

    if (statusCode < 300) {
      statusColor = '\x1b[32m'; // Verde (sucesso)
    } else if (statusCode < 400) {
      statusColor = '\x1b[36m'; // Cyan (redirecionamento)
    } else if (statusCode < 500) {
      statusColor = '\x1b[33m'; // Amarelo (cliente erro)
    } else {
      statusColor = '\x1b[31m'; // Vermelho (servidor erro)
    }

    const reset = '\x1b[0m';

    if (process.env.STATUS_LOGGING !== 'false') {
      // eslint-disable-next-line no-console
      console.log(
        `${statusColor}${res.statusCode} ${statusColor}${req.method.padEnd(6)}${reset} ${req.originalUrl}`,
      );
    }

    return originalJson.call(this, data);
  };

  next();
};
