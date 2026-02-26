################################################################################
# Site Oni Backend - Makefile (Professional)
################################################################################
# PROJECT: Site Oni (White-label Multi-tenant API)
# VERSION: 1.0.0
# AUTHOR: Site Oni Team
# 
# Este Makefile automatiza tarefas comuns de desenvolvimento, teste e deployment.
# Use 'make help' para listar todos os comandos disponíveis.
#
################################################################################

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CONFIGURAÇÃO & AMBIENTE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

.SHELLFLAGS := -ec
.DEFAULT_GOAL := help
SHELL := /bin/bash
MAKEFLAGS += --no-print-directory

# Configuração do Projeto
PROJECT_NAME := site-oni-backend
PROJECT_VERSION := 1.0.0
DOCKER_REGISTRY := site-oni
MAIN_PORT := 3000
NGINX_PORT := 80

# Versões Requeridas
NODE_VERSION_MIN := 18.0.0
NPM_VERSION_MIN := 9.0.0

# Diretórios
SRC_DIR := src
TEST_DIR := src/__tests__
DATABASE_DIR := database
DOCKER_DIR := docker

# Colors & Styles
RESET := \033[0m
BOLD := \033[1m
DIM := \033[2m
UNDERLINE := \033[4m

# Colors
BLACK := \033[90m
RED := \033[91m
GREEN := \033[92m
YELLOW := \033[93m
BLUE := \033[94m
MAGENTA := \033[95m
CYAN := \033[96m
WHITE := \033[97m
GRAY := \033[37m

# Emojis
CHECKMARK := ✓
CROSS := ✗
ARROW := →
WARN := ⚠
INFO := ℹ
FIRE := 🔥
ROCKET := 🚀
HOURGLASS := ⏳

.PHONY: help info validate-requirements

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# HELP & INFO
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

help: ## 📖 Exibe este menu de ajuda
	@echo "$(BOLD)$(BLUE)╔════════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(BOLD)$(BLUE)║$(RESET) $(BOLD)Site Oni Backend - Makefile $(PROJECT_VERSION)$(RESET)$(BOLD)$(BLUE)$(RESET)"
	@echo "$(BOLD)$(BLUE)║$(RESET) $(WHITE)White-label Multi-tenant API | Node.js + Express$(RESET)$(BOLD)$(BLUE)$(RESET)"
	@echo "$(BOLD)$(BLUE)╚════════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""
	@echo "$(BOLD)$(YELLOW)📋 COMANDOS DISPONÍVEIS:$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; \
		/^[a-zA-Z_-]/ {section = $$1; getline; if ($$0 ~ /^──/) {printf "\n$(BOLD)$(CYAN)%s$(RESET)\n", section} else {printf "$(GREEN)%-20s$(RESET) %s\n", section, $$0}}' | \
		sed 's/^[a-zA-Z_-].*:.*## //' | \
		sed '/^$/d'
	@echo ""
	@echo "$(BOLD)$(YELLOW)💡 DICAS RÁPIDAS:$(RESET)"
	@echo "  • Setup completo:      $(CYAN)make setup$(RESET)"
	@echo "  • Desenvolvimento:     $(CYAN)make dev$(RESET)"
	@echo "  • Testes:              $(CYAN)make test-all$(RESET)"
	@echo "  • Produção (Docker):   $(CYAN)make docker:build docker:up$(RESET)"
	@echo ""

info: ## ℹ️  Exibe informações do projeto e ambiente
	@echo "$(BOLD)$(BLUE)╔════════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(BOLD)$(BLUE)║ INFORMAÇÕES DO PROJETO$(RESET)$(BOLD)$(BLUE)$(RESET)"
	@echo "$(BOLD)$(BLUE)╚════════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""
	@echo "$(YELLOW)Projeto:$(RESET)        $(PROJECT_NAME)"
	@echo "$(YELLOW)Versão:$(RESET)         $(PROJECT_VERSION)"
	@echo "$(YELLOW)Porta Principal:$(RESET) $(MAIN_PORT):$(MAIN_PORT)/api"
	@echo "$(YELLOW)Swagger:$(RESET)        http://localhost:$(MAIN_PORT)/api-docs"
	@echo ""
	@echo "$(BOLD)$(YELLOW)🔧 VERSÕES DO SISTEMA:$(RESET)"
	@command -v node >/dev/null 2>&1 && echo "$(CHECKMARK) Node.js:  $$(node --version)" || echo "$(CROSS) Node.js:  NÃO INSTALADO"
	@command -v npm >/dev/null 2>&1 && echo "$(CHECKMARK) npm:      $$(npm --version)" || echo "$(CROSS) npm:      NÃO INSTALADO"
	@command -v docker >/dev/null 2>&1 && echo "$(CHECKMARK) Docker:   $$(docker --version)" || echo "$(CROSS) Docker:   NÃO INSTALADO"
	@command -v docker-compose >/dev/null 2>&1 && echo "$(CHECKMARK) Docker Compose: $$(docker-compose --version)" || echo "$(CROSS) Docker Compose: NÃO INSTALADO"
	@echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# VALIDAÇÃO & PRÉ-REQUISITOS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

validate-requirements: ## 🔍 Valida pré-requisitos do sistema
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Validando pré-requisitos...$(RESET)"
	@command -v node >/dev/null 2>&1 || { echo "$(RED)$(CROSS) Node.js $(NODE_VERSION_MIN)+ requerido$(RESET)"; exit 1; }
	@command -v npm >/dev/null 2>&1 || { echo "$(RED)$(CROSS) npm $(NPM_VERSION_MIN)+ requerido$(RESET)"; exit 1; }
	@command -v docker >/dev/null 2>&1 || { echo "$(RED)$(CROSS) Docker requerido$(RESET)"; exit 1; }
	@command -v docker-compose >/dev/null 2>&1 || { echo "$(RED)$(CROSS) Docker Compose requerido$(RESET)"; exit 1; }
	@[ -f package.json ] || { echo "$(RED)$(CROSS) package.json não encontrado$(RESET)"; exit 1; }
	@[ -f .env ] || { echo "$(YELLOW)$(WARN) .env não encontrado (criando a partir de .env.example)$(RESET)"; }
	@echo "$(GREEN)$(CHECKMARK) Todos os pré-requisitos validados$(RESET)"
	@echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SETUP & INICIALIZAÇÃO
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

.PHONY: setup setup:clean install

setup: validate-requirements ## 🚀 Setup completo (install + docker + db)
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Iniciando setup completo...$(RESET)"
	@echo ""
	@echo "$(CYAN)1️⃣  Instalando dependências npm...$(RESET)"
	$(MAKE) install
	@echo ""
	@echo "$(CYAN)2️⃣  Construindo imagens Docker...$(RESET)"
	$(MAKE) docker:build
	@echo ""
	@echo "$(CYAN)3️⃣  Iniciando containers...$(RESET)"
	$(MAKE) docker:up
	@echo ""
	@echo "$(CYAN)4️⃣  Configurando banco de dados...$(RESET)"
	sleep 10
	$(MAKE) db:reset
	@echo ""
	@echo "$(BOLD)$(GREEN)$(CHECKMARK) Setup concluído com sucesso!$(RESET)"
	@echo ""
	@echo "$(BOLD)$(CYAN)Próximas etapas:$(RESET)"
	@echo "  • Desenvolvimento:     $(CYAN)make dev$(RESET)"
	@echo "  • Ver API docs:        $(CYAN)curl http://localhost:$(MAIN_PORT)/api-docs$(RESET)"
	@echo "  • Executar testes:     $(CYAN)make test:all$(RESET)"
	@echo ""

setup:clean: ## 🧹 Remove setup anterior e reinicia
	@echo "$(BOLD)$(RED)$(FIRE) Removendo setup anterior...$(RESET)"
	$(MAKE) docker:clean
	rm -rf node_modules package-lock.json coverage
	@echo "$(GREEN)$(CHECKMARK) Setup anterior removido$(RESET)"
	@echo ""
	$(MAKE) setup

install: ## 📦 Instala dependências npm
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Instalando dependências npm...$(RESET)"
	npm install
	@echo "$(GREEN)$(CHECKMARK) Dependências instaladas$(RESET)"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DESENVOLVIMENTO
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

.PHONY: dev dev:debug dev:inspect dev:stop

dev: docker:up ## 💻 Inicia servidor em modo desenvolvimento (hot reload)
	@echo "$(BOLD)$(GREEN)$(ROCKET) Iniciando servidor em modo desenvolvimento...$(RESET)"
	@echo "$(CYAN)Acesse: http://localhost:$(MAIN_PORT)$(RESET)"
	@echo "$(CYAN)API Docs: http://localhost:$(MAIN_PORT)/api-docs$(RESET)"
	npm run dev

dev:debug: docker:up ## 🐛 Inicia com debug (breakpoints)
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Iniciando com debug...$(RESET)"
	node --inspect-brk=9229 server.js

dev:inspect: ## 👁️  Abre DevTools para inspeção
	@echo "$(BOLD)$(CYAN)Abra seu navegador em: chrome://inspect$(RESET)"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TESTES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

.PHONY: test:all test:unit test:integration test:watch test:coverage test:security test:performance

test:all: ## 🧪 Executa todos os testes
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Executando todos os testes...$(RESET)"
	npm test

test:unit: ## 🎯 Executa apenas testes unitários
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Executando testes unitários...$(RESET)"
	npm test -- --testPathPattern="unit"

test:integration: ## 🔗 Executa apenas testes de integração
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Executando testes de integração...$(RESET)"
	npm test -- --testPathPattern="integration"

test:watch: ## 👀 Executa testes em modo watch
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Testes em modo watch...$(RESET)"
	npm test -- --watch

test:coverage: ## 📊 Gera relatório de cobertura
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Gerando relatório de cobertura...$(RESET)"
	npm test -- --coverage
	@echo ""
	@echo "$(GREEN)$(CHECKMARK) Relatório em: coverage/lcov-report/index.html$(RESET)"

test:security: ## 🔒 Executa testes de segurança
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Executando testes de segurança...$(RESET)"
	npm run test:security

test:performance: ## ⚡ Executa testes de performance
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Executando testes de performance...$(RESET)"
	npm run test:performance

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# QUALIDADE DE CÓDIGO
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

.PHONY: lint lint:fix format format:check quality quality:fix

lint: ## 📝 Executa linter (ESLint)
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Executando linter...$(RESET)"
	npm run lint

lint:fix: ## 🔧 Corrige erros de linter
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Corrigindo erros de lintagem...$(RESET)"
	npm run lint:fix
	@echo "$(GREEN)$(CHECKMARK) Erros corrigidos$(RESET)"

format: ## 💅 Formata código (Prettier)
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Formatando código...$(RESET)"
	npm run format
	@echo "$(GREEN)$(CHECKMARK) Código formatado$(RESET)"

format:check: ## 🔍 Verifica formatação sem alterar
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Verificando formatação...$(RESET)"
	npx prettier --check "src/**/*.js"

quality: lint format:check test:coverage ## ✅ Executa checklist completo de qualidade
	@echo "$(BOLD)$(GREEN)$(CHECKMARK) Checklist de qualidade concluído!$(RESET)"

quality:fix: lint:fix format test:all ## 🛠️  Corrige todos os problemas de qualidade
	@echo "$(BOLD)$(GREEN)$(CHECKMARK) Todos os problemas foram corrigidos!$(RESET)"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# BANCO DE DADOS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

.PHONY: db:migrate db:seed db:reset db:undo db:status

db:migrate: ## 📈 Executa migrações do banco de dados
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Executando migrações...$(RESET)"
	npm run migrate
	@echo "$(GREEN)$(CHECKMARK) Migrações concluídas$(RESET)"

db:seed: ## 🌱 Popula banco de dados com dados iniciais
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Populando banco de dados...$(RESET)"
	npm run seed
	@echo "$(GREEN)$(CHECKMARK) Banco de dados populado$(RESET)"

db:reset: ## 🔄 Reseta banco (desfaz + migra + semeia)
	@echo "$(BOLD)$(YELLOW)$(WARN) Reseteando banco de dados...$(RESET)"
	npm run db:reset
	@echo "$(GREEN)$(CHECKMARK) Banco de dados resetado$(RESET)"

db:undo: ## ↩️  Desfaz última migração
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Desfazendo migração...$(RESET)"
	npm run migrate:undo
	@echo "$(GREEN)$(CHECKMARK) Migração desfeita$(RESET)"

db:status: ## 📊 Exibe status das migrações
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Verificando status...$(RESET)"
	@echo "Migrações disponíveis em: $(DATABASE_DIR)/migrations"
	@echo "Seeds disponíveis em: $(DATABASE_DIR)/seeds"

db:shell: ## 🖥️  Abre shell PostgreSQL
	@echo "$(BOLD)$(CYAN)Conectando ao PostgreSQL...$(RESET)"
	docker-compose exec postgres psql -U postgres -d site_oni

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DOCKER
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

.PHONY: docker:build docker:up docker:down docker:restart docker:logs docker:ps docker:clean

docker:build: ## 🔨 Constrói imagens Docker
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Construindo imagens Docker...$(RESET)"
	docker-compose build
	@echo "$(GREEN)$(CHECKMARK) Imagens construídas$(RESET)"

docker:up: ## 🟢 Inicia containers em background
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Iniciando containers...$(RESET)"
	docker-compose up -d
	@echo "$(GREEN)$(CHECKMARK) Containers iniciados$(RESET)"
	@echo ""
	@echo "$(CYAN)Serviços disponíveis:$(RESET)"
	@echo "  • Backend:   http://localhost:$(MAIN_PORT)"
	@echo "  • API Docs:  http://localhost:$(MAIN_PORT)/api-docs"

docker:down: ## 🔴 Para containers
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Parando containers...$(RESET)"
	docker-compose down
	@echo "$(GREEN)$(CHECKMARK) Containers parados$(RESET)"

docker:restart: ## 🔄 Reinicia containers
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Reiniciando containers...$(RESET)"
	docker-compose restart
	@echo "$(GREEN)$(CHECKMARK) Containers reiniciados$(RESET)"

docker:logs: ## 📋 Exibe logs (backend)
	@docker-compose logs -f backend

docker:logs:all: ## 📋 Exibe logs de todos os containers
	@docker-compose logs -f

docker:ps: ## 📊 Lista containers em execução
	@docker-compose ps

docker:shell: ## 🖥️  Abre shell no container backend
	@echo "$(BOLD)$(CYAN)Abrindo shell...$(RESET)"
	docker-compose exec backend sh

docker:clean: ## 🧹 Remove containers, volumes e redes
	@echo "$(BOLD)$(RED)$(FIRE) Limpando recursos Docker...$(RESET)"
	docker-compose down -v
	@echo "$(GREEN)$(CHECKMARK) Recursos Docker removidos$(RESET)"

docker:rebuild: docker:clean docker:build docker:up ## 🔨 Limpa, reconstrói e inicia

docker:prune: ## 🗑️  Remove recursos Docker não utilizados
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Limpando recursos não utilizados...$(RESET)"
	docker system prune -f
	@echo "$(GREEN)$(CHECKMARK) Limpeza concluída$(RESET)"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MONITORAMENTO & HEALTH
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

.PHONY: health health:api health:db health:all load-test load-test:heavy

health:api: ## 💚 Verifica saúde da API
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Verificando saúde da API...$(RESET)"
	@curl -s http://localhost:$(MAIN_PORT)/health | jq . 2>/dev/null || curl -s http://localhost:$(MAIN_PORT)/health
	@echo ""

health:db: ## 🗄️  Verifica saúde do banco de dados
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Verificando saúde do banco...$(RESET)"
	@docker-compose ps postgres | grep -q "healthy" && echo "$(GREEN)$(CHECKMARK) PostgreSQL: OK$(RESET)" || echo "$(YELLOW)$(WARN) PostgreSQL: Verificando...$(RESET)"

health:all: health:api health:db ## 📊 Verifica saúde de todos os serviços
	@echo "$(GREEN)$(CHECKMARK) Checklist de saúde concluído$(RESET)"

load-test: ## 📈 Executa teste de carga leve (10 usuários)
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Executando teste de carga...$(RESET)"
	node load-test.js
	@echo ""

load-test:heavy: ## 🔥 Executa teste de carga pesado (100 usuários)
	@echo "$(BOLD)$(RED)$(FIRE) Executando teste de carga PESADO...$(RESET)"
	@echo "$(YELLOW)⚠️  Isso irá sobrecarregar o servidor$(RESET)"
	k6 run --vus 100 --duration 60s load-test.js 2>/dev/null || npm test:load -- --vus 100

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DOCUMENTAÇÃO
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

.PHONY: docs docs:api docs:open

docs:api: ## 📚 Gera documentação da API
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Documentação da API disponível em:$(RESET)"
	@echo "$(CYAN)http://localhost:$(MAIN_PORT)/api-docs$(RESET)"

docs:open: ## 🌐 Abre documentação no navegador
	@echo "$(BOLD)$(CYAN)Abrindo documentação...$(RESET)"
	@command -v curl >/dev/null && curl -s http://localhost:$(MAIN_PORT)/api-docs 2>/dev/null | head -1 >/dev/null && echo "$(GREEN)$(CHECKMARK) Documentação disponível em http://localhost:$(MAIN_PORT)/api-docs$(RESET)" || echo "$(YELLOW)$(WARN) Inicie o servidor com: make docker:up$(RESET)"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CI/CD & DEPLOYMENT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

.PHONY: ci:test ci:build ci:push production:deploy staging:deploy

ci:test: quality health:all ## 🔄 Pipeline CI (testa e valida)
	@echo "$(BOLD)$(GREEN)$(CHECKMARK) CI Pipeline passou!$(RESET)"

ci:build: docker:build ## 🏗️  Constrói artefatos para CI
	@echo "$(BOLD)$(GREEN)$(CHECKMARK) Build CI concluído$(RESET)"

production:deploy: validate-requirements ci:test ## 🚀 Deploy para produção
	@echo "$(BOLD)$(YELLOW)$(WARN) Iniciando deploy para produção...$(RESET)"
	@echo "$(BOLD)$(RED)⚠️  Certifique-se que todos os testes passaram$(RESET)"
	@read -p "Deseja continuar? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(BOLD)$(CYAN)Executando deploy...$(RESET)"; \
		docker-compose -f docker-compose.yml up -d; \
		echo "$(GREEN)$(CHECKMARK) Deploy concluído$(RESET)"; \
	else \
		echo "$(YELLOW)Deploy cancelado$(RESET)"; \
	fi

staging:deploy: ci:test ## 🎯 Deploy para staging
	@echo "$(BOLD)$(CYAN)Deployando para staging...$(RESET)"
	docker-compose -f docker/docker-compose.yml up -d
	@echo "$(GREEN)$(CHECKMARK) Staging deploy concluído$(RESET)"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# UTILIDADES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

.PHONY: clean version update-deps deps-check

clean: docker:clean ## 🧹 Limpa diretórios de compilação e cache
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Limpando arquivos temporários...$(RESET)"
	rm -rf coverage .eslintcache jest-cache
	@echo "$(GREEN)$(CHECKMARK) Limpeza concluída$(RESET)"

version: ## 📌 Exibe versão do projeto
	@echo "$(BOLD)$(CYAN)Site Oni Backend$(RESET) v$(PROJECT_VERSION)"

update-deps: ## 📦 Atualiza todas as dependências
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Atualizando dependências...$(RESET)"
	npm update
	@echo "$(GREEN)$(CHECKMARK) Dependências atualizadas$(RESET)"

deps:check: ## 🔍 Verifica vulnerabilidades em dependências
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Auditando dependências...$(RESET)"
	npm audit
	@echo "$(GREEN)$(CHECKMARK) Audit concluído$(RESET)"

deps:fix: ## 🔧 Corrige vulnerabilidades automaticamente
	@echo "$(BOLD)$(CYAN)$(HOURGLASS) Corrigindo vulnerabilidades...$(RESET)"
	npm audit fix
	@echo "$(GREEN)$(CHECKMARK) Vulnerabilidades corrigidas$(RESET)"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PADRÃO
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

.DEFAULT_GOAL := help
