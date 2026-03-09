#!/usr/bin/env node
/**
 * 🚀 LOAD TEST - API Performance Testing
 *
 * Simula usuários reaiscom comportamento realista
 * Cada usuário: 2-4 requisições espaçadas de 1-2 segundos
 * Cenário: 10 usuários simultâneos durante 60 segundos
 *
 * Resultado esperado: ~30-40 requisições com 100% taxa de sucesso
 * Tempo médio resposta: 10-15ms
 *
 * Uso:
 *   node scripts/load-test.js
 *
 * Requisitos:
 *   - Servidor rodando: npm run dev
 *   - Database migrado: npm run migrate
 */

import http from 'http';
import { performance } from 'perf_hooks';

const BASE_URL = 'http://localhost:3000/api/v1';
const CONCURRENT_USERS = 10;
const TEST_DURATION_SEC = 60;
const REQUESTS_PER_USER = 3; // Cada usuário faz ~3 requisições

const ENDPOINTS = [
  '/parceiros',
  '/temas',
  '/paginas',
  '/componentes',
  '/elementos',
  '/cores',
  '/imagens',
  '/links',
];

class NormalLoadTest {
  constructor() {
    this.results = {
      total: 0,
      success: 0,
      failed: 0,
      times: [],
      errors: {},
      endpoints: {},
    };
    this.token = null;
    this.start = Date.now();
  }

  async authenticate() {
    return new Promise((resolve) => {
      const postData = JSON.stringify({
        email: 'admin@siteoni.com.br',
        senha: 'admin123',
      });

      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/v1/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
        timeout: 5000,
      };

      const request = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            this.token = json.data?.token;
            resolve(!!this.token);
          } catch {
            resolve(false);
          }
        });
      });

      request.on('error', () => resolve(false));
      request.on('timeout', () => {
        request.destroy();
        resolve(false);
      });

      request.write(postData);
      request.end();
    });
  }

  async makeRequest(path) {
    return new Promise((resolve) => {
      const start = performance.now();
      const fullUrl = `${BASE_URL}${path}`;

      const options = {
        timeout: 5000,
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      };

      const request = http.get(fullUrl, options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({
            path,
            status: res.statusCode,
            time: performance.now() - start,
            ok: res.statusCode >= 200 && res.statusCode < 300,
          });
        });
      });

      request.on('error', (err) => {
        resolve({
          path,
          status: 0,
          time: performance.now() - start,
          ok: false,
          error: err.message,
        });
      });

      request.on('timeout', () => {
        request.destroy();
        resolve({
          path,
          status: 0,
          time: performance.now() - start,
          ok: false,
          error: 'Timeout',
        });
      });
    });
  }

  async simulate() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TESTE DE CARGA - CONDIÇÕES NORMAIS');
    console.log('='.repeat(60));
    console.log(`URL: ${BASE_URL}`);
    console.log(`Usuários: ${CONCURRENT_USERS}`);
    console.log(`Duração: ${TEST_DURATION_SEC}s`);
    console.log(`Requisições/usuário: ${REQUESTS_PER_USER}`);
    console.log(
      `Total esperado: ~${CONCURRENT_USERS * REQUESTS_PER_USER} requisiçõese`,
    );
    console.log('='.repeat(60) + '\n');

    // Autentica primeiro
    console.log('🔐 Autenticando...');
    const authenticated = await this.authenticate();
    if (!authenticated) {
      console.log('❌ Falha na autenticação.\n');
      return;
    }
    console.log('✅ Autenticado com sucesso!\n');

    const endTime = this.start + TEST_DURATION_SEC * 1000;
    let activeUsers = 0;

    for (let u = 0; u < CONCURRENT_USERS; u++) {
      // Espaça os usuários ao longo do tempo
      const delay = (u / CONCURRENT_USERS) * (TEST_DURATION_SEC * 1000 * 0.6);

      setTimeout(async () => {
        activeUsers++;
        process.stdout.write(
          `👥 Usuários ativos: ${activeUsers}/${CONCURRENT_USERS}\r`,
        );

        // Cada usuário faz entre 2-4 requisições
        const requests = 2 + Math.random() * 2;
        for (let r = 0; r < requests; r++) {
          if (Date.now() > endTime) break;

          const path = ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
          const result = await this.makeRequest(path);

          this.results.total++;
          this.results.times.push(result.time);

          if (!this.results.endpoints[path]) {
            this.results.endpoints[path] = { total: 0, success: 0, times: [] };
          }
          this.results.endpoints[path].total++;
          this.results.endpoints[path].times.push(result.time);

          if (result.ok) {
            this.results.success++;
            this.results.endpoints[path].success++;
          } else {
            this.results.failed++;
            const err = result.error || `HTTP ${result.status}`;
            this.results.errors[err] = (this.results.errors[err] || 0) + 1;
          }

          process.stdout.write(
            `📊 ${this.results.total.toString().padEnd(5)} reqs | ✅ ${this.results.success.toString().padEnd(5)} | ❌ ${this.results.failed}\r`,
          );

          // Delay entre requisições do mesmo usuário
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 + Math.random() * 1000),
          );
        }

        activeUsers--;
      }, delay);
    }

    // Espera teste terminar
    await new Promise((resolve) =>
      setTimeout(resolve, (TEST_DURATION_SEC + 10) * 1000),
    );

    this.printReport();
  }

  printReport() {
    if (this.results.total === 0) {
      console.log('\n\n❌ Nenhuma requisição foi feita.\n');
      return;
    }

    const duration = (Date.now() - this.start) / 1000;
    const times = this.results.times.sort((a, b) => a - b);
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const throughput = (this.results.total / duration).toFixed(2);
    const successRate = (
      (this.results.success / this.results.total) *
      100
    ).toFixed(1);

    console.log('\n\n' + '='.repeat(70));
    console.log('📊 RELATÓRIO DE TESTE DE CARGA');
    console.log('='.repeat(70) + '\n');

    console.log('📈 RESUMO GERAL:');
    console.log(`  Total de requisições:  ${this.results.total}`);
    console.log(`  ✅ Sucessos:            ${this.results.success}`);
    console.log(`  ❌ Falhas:              ${this.results.failed}`);
    console.log(`  📊 Taxa de sucesso:     ${successRate}%`);
    console.log(`  🔄 Throughput:          ${throughput} req/s`);
    console.log(`  ⏱️  Duração total:       ${duration.toFixed(1)}s`);

    console.log(`\n⏱️  PERFORMANCE GERAL (ms):`);
    console.log(`  Min:        ${times[0].toFixed(2)}`);
    console.log(`  Máx:        ${times[times.length - 1].toFixed(2)}`);
    console.log(`  Média:      ${avg.toFixed(2)}`);
    console.log(
      `  P50:        ${times[Math.floor(times.length * 0.5)].toFixed(2)}`,
    );
    console.log(
      `  P95:        ${times[Math.floor(times.length * 0.95)].toFixed(2)}`,
    );
    console.log(
      `  P99:        ${times[Math.floor(times.length * 0.99)].toFixed(2)}`,
    );

    console.log(`\n📍 PERFORMANCE POR ENDPOINT:`);
    console.log(
      `${'Endpoint'.padEnd(20)} | ${'Reqs'.padEnd(6)} | ${'Sucesso'.padEnd(8)} | ${'Média (ms)'.padEnd(10)}`,
    );
    console.log('-'.repeat(70));

    Object.entries(this.results.endpoints)
      .sort((a, b) => b[1].total - a[1].total)
      .forEach(([endpoint, stats]) => {
        const epavg =
          stats.times.reduce((a, b) => a + b, 0) / stats.times.length;
        const epsuccess = ((stats.success / stats.total) * 100).toFixed(0);
        console.log(
          `${endpoint.padEnd(20)} | ${stats.total.toString().padEnd(6)} | ${epsuccess.padEnd(7)}% | ${epavg.toFixed(2).padEnd(10)}`,
        );
      });

    if (Object.keys(this.results.errors).length > 0) {
      console.log(`\n⚠️  ERROS REGISTRADOS:`);
      Object.entries(this.results.errors)
        .sort((a, b) => b[1] - a[1])
        .forEach(([err, count]) => {
          const pct = ((count / this.results.total) * 100).toFixed(1);
          console.log(
            `  ${err.padEnd(25)} ${count.toString().padEnd(6)} (${pct}%)`,
          );
        });
    }

    console.log('\n' + '='.repeat(70));
    if (successRate >= 99) {
      console.log('✅ STATUS: EXCELENTE - Pronto para produção!\n');
    } else if (successRate >= 95) {
      console.log(
        '🟢 STATUS: BOM - Sistema estável na maioria das situações\n',
      );
    } else if (successRate >= 90) {
      console.log('🟡 STATUS: ACEITÁVEL - Melhorias recomendadas\n');
    } else {
      console.log('🔴 STATUS: ATENÇÃO - Rate limit ou problemas detectados\n');
    }
  }
}

new NormalLoadTest().simulate().catch(console.error);
