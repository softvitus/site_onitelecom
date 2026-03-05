/**
 * Jest Setup File
 * Executa antes de todos os testes
 * NODE_ENV=test definido via npm script (package.json)
 */

// Importa configuração (carregará .env.test)
import '../../src/config/sequelize.js';

// Mock console.error para reduzir ruído
// eslint-disable-next-line no-console
global.console.error = jest.fn((...args) => {
  if (args[0]?.includes?.('error') || args[0]?.includes?.('Error')) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
});

// Timeout para operações assíncronas (DB, requisições, etc)
jest.setTimeout(30000);
