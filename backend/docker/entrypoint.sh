#!/bin/sh

# ═════════════════════════════════════════════════════════════════════════════
# ENTRYPOINT SCRIPT - Backend Docker Container
# ═════════════════════════════════════════════════════════════════════════════
# Responsabilidades:
#   1. Executar migrations do banco de dados
#   2. Executar seeds (dados iniciais)
#   3. Iniciar a aplicação Node.js
# ═════════════════════════════════════════════════════════════════════════════

set -e  # Sair em caso de erro

echo "═════════════════════════════════════════════════════════════════════"
echo "🚀 INICIANDO BACKEND CONTAINER"
echo "═════════════════════════════════════════════════════════════════════"

# 1. Aguardar por qualquer configuração inicial (se necessário)
echo "[1/4] Aguardando inicialização..."
sleep 2

# 2. Executar migrations
echo "[2/4] Executando migrations do banco de dados..."
npm run db:migrate 2>/dev/null || {
  echo "⚠️  Migrations falharam ou não existem - continuando..."
}

# 3. Executar seeds
echo "[3/4] Executando seeds (dados iniciais)..."
npm run db:seed 2>/dev/null || {
  echo "⚠️  Seeds falharam ou não existem - continuando..."
}

# 4. Iniciar a aplicação
echo "[4/4] Iniciando aplicação Node.js..."
echo "═════════════════════════════════════════════════════════════════════"

# Usar exec para substituir o processo do shell (PID 1)
# Isso garante que sinais (SIGTERM, SIGINT) sejam passados corretamente
exec npm start
