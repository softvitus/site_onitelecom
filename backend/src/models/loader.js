import { loadModels } from './index.js';
import sequelize from '../config/sequelize.js';

let models = null;

/**
 * Retorna instância cached dos modelos
 */
export function getModels() {
  if (!models) {
    models = loadModels(sequelize);
  }
  return models;
}
