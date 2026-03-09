import sequelize from './src/config/sequelize.js';
import app from './src/app.js';

const { PORT, HOST, NODE_ENV, API_VERSION } = process.env;

async function start() {
  try {
    const server = app.listen(PORT, HOST, () => {
      console.log(
        `\n[SERVER] ✓ Iniciado em http://${HOST}:${PORT} (${NODE_ENV}) v${API_VERSION}\n`,
      );
    });

    const shutdown = (signal) => {
      console.log(`\n[SERVER] ${signal} recebido. Encerrando...\n`);
      server.close(() => process.exit(0));
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('[ERROR]', error.message);
    process.exit(1);
  }
}

start();

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT]', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED]', reason);
  process.exit(1);
});
