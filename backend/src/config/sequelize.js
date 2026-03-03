/**
 * Sequelize ORM Instance
 * 
 * Inicializa a conexão com o banco de dados
 * Carrega modelos e define associações
 */

import { Sequelize } from 'sequelize';
import dbConfig from './database.js';
import { loadModels } from '../models/index.js';

// Obtém configuração do ambiente atual
const config = dbConfig[process.env.NODE_ENV];

// Cria instância do Sequelize
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    pool: config.pool,
  },
);

// Carrega modelos e associações
loadModels(sequelize);

export default sequelize;
