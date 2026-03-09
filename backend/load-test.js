import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate } from 'k6/metrics';

/**
 * K6 Load Testing Script
 *
 * Como executar:
 *   npm install -g k6
 *   k6 run load-test.js
 *
 * Opções:
 *   k6 run --vus 50 --duration 30s load-test.js
 *   k6 run --stage 30s:50 --stage 1m30s:100 --stage 20s:0 load-test.js
 */

export const options = {
  // Estágio 1: Ramp-up (0 -> 10 VUs em 10s)
  // Estágio 2: Carga sustentada (10 VUs por 20s)
  // Estágio 3: Ramp-down (10 -> 0 VUs em 5s)
  stages: [
    { duration: '10s', target: 10 }, // Ramp-up
    { duration: '20s', target: 10 }, // Stay at 10 VUs
    { duration: '5s', target: 0 }, // Ramp-down
  ],
  thresholds: {
    // API response time 95th percentile < 500ms
    'http_req_duration{staticAsset:no}': ['p(95)<500', 'p(99)<1000'],
    // Taxa de erro < 1%
    http_req_failed: ['rate<0.01'],
    // Taxa de sucesso > 99%
    http_req_success_rate: ['rate>0.99'],
  },
};

// Métricas customizadas
const successRate = new Rate('http_req_success_rate');

// Base URL (ajuste conforme necessário)
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const API_VERSION = 'v1';
const API_URL = `${BASE_URL}/api/${API_VERSION}`;

// Token para autenticação (ajuste com token real se necessário)
let authToken = null;

export function setup() {
  console.log('===== Load Test Setup =====');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`API URL: ${API_URL}`);

  // Fazer login ou obter um token
  // const loginRes = http.post(`${API_URL}/auth/login`, {
  //   email: 'test@example.com',
  //   senha: 'password123',
  // });
  // if (loginRes.status === 200) {
  //   authToken = loginRes.json('token');
  //   console.log('✓ Token obtido');
  // }

  return { token: authToken };
}

export default function (data) {
  const token = data.token;
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  // ========== HEALTH CHECKS ==========
  group('Health Checks', () => {
    // Health check detalhado
    let res = http.get(`${BASE_URL}/health`, { headers });
    successRate.add(res.status === 200);
    check(res, {
      'health status 200': (r) => r.status === 200,
      'health has components': (r) => r.json('components') !== undefined,
      'database is ok': (r) => r.json('components.database.status') === 'ok',
    });

    // Readiness probe
    res = http.get(`${BASE_URL}/health/ready`, { headers });
    check(res, {
      'ready status 200': (r) => r.status === 200,
      'ready is true': (r) => r.json('ready') === true,
    });

    // Liveness probe
    res = http.get(`${BASE_URL}/health/live`, { headers });
    check(res, {
      'live status 200': (r) => r.status === 200,
      'liveness working': (r) => r.json('alive') === true,
    });

    sleep(1);
  });

  // ========== AUTENTICAÇÃO ==========
  group('Authentication', () => {
    // Login (se houver usuário de teste)
    const loginPayload = {
      email: 'admin@example.com',
      senha: 'Admin@123456',
    };

    let res = http.post(`${API_URL}/auth/login`, JSON.stringify(loginPayload), {
      headers,
    });

    successRate.add(res.status === 200 || res.status === 401);
    check(res, {
      'login attempt returns valid response': (r) =>
        r.status === 200 || r.status === 401,
      'response has token or error message': (r) =>
        r.json('token') !== null || r.json('message') !== undefined,
    });

    sleep(1);
  });

  // ========== API ENDPOINTS ==========
  group('API Endpoints', () => {
    // Listar parceiros (exemplo de endpoint GET)
    let res = http.get(`${API_URL}/parceiros?limit=10&offset=0`, { headers });
    successRate.add(res.status === 200);
    check(res, {
      'list parceiros returns 200': (r) => r.status === 200,
      'response is array or object': (r) =>
        typeof r.json() === 'object' || Array.isArray(r.json()),
    });

    sleep(0.5);

    // Verificar token (se houver token disponível)
    res = http.post(
      `${API_URL}/auth/verify`,
      JSON.stringify({ token: token || 'test' }),
      { headers },
    );
    successRate.add(res.status === 200 || res.status === 401);
    check(res, {
      'verify token returns valid status': (r) =>
        r.status === 200 || r.status === 401,
    });

    sleep(1);
  });

  // ========== RATE LIMITING ==========
  group('Rate Limiting', () => {
    // Fazer múltiplas requisições rápidas para testar rate limiting
    let responses = [];
    for (let i = 0; i < 3; i++) {
      const res = http.get(`${BASE_URL}/health`, { headers });
      responses.push(res);
      check(res, {
        'rapid requests succeed or rate limited': (r) =>
          r.status === 200 || r.status === 429,
      });
    }

    sleep(1);
  });

  sleep(2);
}

export function teardown() {
  console.log('===== Load Test Complete =====');
  console.log(`Base URL tested: ${BASE_URL}`);
  console.log('Report saved in summary');
}
