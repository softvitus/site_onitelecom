import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.resolve(__dirname, '../../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const node_env = process.env.NODE_ENV;
const envConfig = packageJson.envConfig;

if (!envConfig[node_env]) {
  throw new Error(
    `[ENV] NODE_ENV inválido: ${node_env}. Valores válidos: ${Object.keys(envConfig).join(', ')}`,
  );
}

const envFilename = envConfig[node_env];
const envPath = path.resolve(envFilename);

if (!fs.existsSync(envPath)) {
  throw new Error(`[ENV] Arquivo ${envFilename} não encontrado em ${envPath}`);
}

const result = dotenv.config({ path: envPath });

if (result.error && result.error.code !== 'ENOENT') {
  throw new Error(`[ENV] Erro ao carregar: ${result.error.message}`);
}

if (node_env === 'development' && process.env.DEBUG_CONFIG === 'true') {
  // eslint-disable-next-line no-console
  console.log(`[CONFIG] ✓ Ambiente carregado: ${node_env}`);
}

export default true;
