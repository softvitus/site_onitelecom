# 🎯 ONI Telecom - Site Institucional

> Plataforma moderna para gerenciamento e apresentação de serviços de telecomunicações

[![CI/CD Pipeline](https://github.com/softvitus/site_onitelecom/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/softvitus/site_onitelecom/actions/workflows/ci-cd.yml)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Code Coverage](https://img.shields.io/badge/coverage-80%25+-green)](coverage/)

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Stack Tecnológico](#stack-tecnológico)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Guia de Setup](#guia-de-setup)
- [Como Rodar](#como-rodar)
- [Desenvolvimento](#desenvolvimento)
- [Testes](#testes)
- [Deployment](#deployment)
- [Documentação](#documentação)
- [Contribuindo](#contribuindo)

---

## 🔍 Visão Geral

Site institucional completo da ONI Telecom com:

- ✅ **Frontend Responsivo** - React 18.2 com styled-components
- ✅ **Painel Administrativo** - Vite + React para gerenciamento
- ✅ **API REST** - Node.js/Express com PostgreSQL
- ✅ **Docker Production-Ready** - Multi-stage builds otimizados
- ✅ **CI/CD Automático** - GitHub Actions com testes e cobertura
- ✅ **Zero Lint Warnings** - ESLint configurado rigorosamente

---

## 🏗️ Stack Tecnológico

### **Backend**

- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **Auth**: JWT
- **Testing**: Jest + Supertest
- **ORM**: Sequelize
- **Documentation**: Swagger/OpenAPI (em breve)

### **Frontend Principal**

- **Framework**: React 18.2
- **Build Tool**: Create React Scripts 5.0
- **Styling**: CSS Modules + styled-components
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + Prettier

### **Frontend Painel**

- **Framework**: React 18.2
- **Build Tool**: Vite 5.x
- **Styling**: CSS Modules
- **Linting**: ESLint + Prettier

### **DevOps**

- **Containerização**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Versionamento**: Git + GitHub
- **Code Quality**: ESLint, Jest Coverage

---

## 📁 Estrutura do Projeto

```
site_oni/
├── backend/                    # API REST - Node.js/Express
│   ├── src/
│   │   ├── controllers/        # Controladores de requisições
│   │   ├── models/             # Modelos de dados
│   │   ├── routes/             # Definição de rotas
│   │   ├── middleware/         # Middlewares
│   │   ├── services/           # Lógica de negócio
│   │   ├── utils/              # Funções utilitárias
│   │   └── app.js              # Configuração Express
│   ├── database/
│   │   ├── migrations/         # Migrações de schema
│   │   └── seeds/              # Dados iniciais
│   ├── docker/
│   │   ├── Dockerfile          # Build otimizado
│   │   ├── docker-compose.yml  # Orquestração
│   │   └── nginx/              # Configuração reverse proxy
│   └── package.json
│
├── frontend/                   # Cliente Principal - React
│   ├── src/
│   │   ├── componentes/        # Componentes React
│   │   ├── paginas/            # Páginas
│   │   ├── servicos/           # Chamadas HTTP
│   │   ├── hooks/              # Custom hooks
│   │   ├── contexts/           # Context API
│   │   ├── estilos/            # CSS Modules
│   │   └── __tests__/          # Testes
│   ├── docker/
│   │   ├── Dockerfile          # Build multi-stage
│   │   └── nginx/              # Configuração web server
│   └── package.json
│
├── frontend_painel/            # Painel Administrativo - Vite
│   ├── src/
│   │   ├── componentes/
│   │   ├── paginas/
│   │   ├── servicos/
│   │   └── ...
│   ├── docker/
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # Pipeline automático
│
├── .env.example                # Variáveis de exemplo
├── docker-compose.yml          # Orquestração root
└── README.md                   # Este arquivo
```

---

## 🚀 Guia de Setup

### **Pré-requisitos**

- **Node.js** >= 20.0.0 ([download](https://nodejs.org/))
- **PostgreSQL** >= 15 ou **Docker** ([download](https://www.docker.com/))
- **Git** ([download](https://git-scm.com/))

### **1. Clonar Repositório**

```bash
git clone https://github.com/softvitus/site_onitelecom.git
cd site_oni
```

### **2. Configurar Variáveis de Ambiente**

```bash
# Criar .env.development para desenvolvimento local
cp backend/.env.example backend/.env.development
cp frontend/.env.example frontend/.env

# Editar com suas credenciais
nano backend/.env.development
```

### **3. Instalar Dependências**

```bash
# Backend
cd backend
npm install --legacy-peer-deps
npm run db:migrate
npm run db:seed

# Frontend
cd ../frontend
npm install --legacy-peer-deps

# Frontend Painel
cd ../frontend_painel
npm install --legacy-peer-deps
```

### **4. Setup de Git Hooks (Opcional)**

```bash
cd ..
npm install -D husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

---

## 🏃 Como Rodar

### **Opção 1: Docker (Recomendado para Produção)**

```bash
# Build e start todos os serviços
docker-compose up --build

# Após primeira execução
docker-compose up
```

**Acesso:**

- 🏠 Frontend: http://localhost:3000
- 📊 Painel: http://localhost:3001
- 🔌 API: http://localhost:5000

### **Opção 2: Desenvolvimento Local**

```bash
# Terminal 1: Backend
cd backend
npm start
# API em http://localhost:3000

# Terminal 2: Frontend
cd frontend
npm start
# Site em http://localhost:3000

# Terminal 3: Frontend Painel
cd frontend_painel
npm run dev
# Painel em http://localhost:5173
```

---

## 💻 Desenvolvimento

### **Padrões de Código**

- ✅ **ESLint** - Validação automática
- ✅ **Prettier** - Formatação consistente
- ✅ **Conventional Commits** - Versionamento semântico

### **Linting**

```bash
# Verificar erros
npm run lint

# Corrigir automaticamente
npm run lint:fix

# Rodar em todos os projetos
npm run lint:all         # Backend + Frontend + Painel
```

### **Estrutura de Commits**

```
feat: adicionar nova funcionalidade
fix: corrigir bug
docs: atualizar documentação
style: formatar código
refactor: reorganizar código
test: adicionar testes
chore: atualizar dependências
```

---

## 🧪 Testes

### **Backend**

```bash
cd backend

# Rodar todos os testes
npm test

# Com cobertura
npm test -- --coverage

# Modo watch
npm test -- --watch
```

**Métricas Atuais:**

- ✅ 707/707 testes passando
- ✅ 0 erros de lint
- ✅ 6 warnings aceitáveis

### **Frontend**

```bash
cd frontend

# Rodar testes
npm test -- --watchAll=false

# Com cobertura
npm test -- --coverage --watchAll=false
```

**Métricas Atuais:**

- ✅ 0 erros de lint
- ✅ 0 warnings

### **Frontend Painel**

```bash
cd frontend_painel

# Linting
npm run lint

# Build
npm run build
```

**Métricas Atuais:**

- ✅ 0 erros de lint
- ✅ 0 warnings

---

## 📦 Deployment

### **GitHub Actions (CI/CD Automático)**

Pipeline automático em cada push:

1. **Lint** - Validação de código
2. **Test** - Testes unitários
3. **Build** - Construção de imagens
4. **Deploy** - Envio para produção (se configurado)

**Ver status:** [GitHub Actions](https://github.com/softvitus/site_onitelecom/actions)

### **Docker Hub (Opcional)**

```bash
# Build e push para Docker Hub
docker build -t seu-usuario/site-oni-backend:latest ./backend
docker push seu-usuario/site-oni-backend:latest
```

### **Azure/Cloud (em breve)**

- Terraform para IaC
- App Service/Container Instances
- Database gerenciado

---

## 📚 Documentação

### **API REST** (em breve)

- Swagger/OpenAPI em `http://localhost:5000/api-docs`
- Salvo em `backend/docs/api.yaml`

### **Database Schema**

- Diagrama ER em desenvolvimento
- Migrações em `backend/database/migrations/`

### **Componentes Frontend**

- Storybook em desenvolvimento
- Exemplos em `frontend/src/componentes/`

---

## 🤝 Contribuindo

### **Fluxo de Contribuição**

1. Fork o repositório
2. Criar branch: `git checkout -b feature/sua-feature`
3. Commit com Conventional Commits: `git commit -m "feat: descrição"`
4. Push: `git push origin feature/sua-feature`
5. Abrir Pull Request

### **Requisitos para PR**

- ✅ Testes passando (`npm test`)
- ✅ Lint limpo (`npm run lint`)
- ✅ Commits semânticos
- ✅ Documentação atualizada

---

## 📞 Suporte

- 📧 Email: dev@onitelecom.com.br
- 🐛 Issues: [GitHub Issues](https://github.com/softvitus/site_onitelecom/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/softvitus/site_onitelecom/discussions)

---

## 📄 Licença

MIT © 2024-2026 ONI Telecom

---

## 🙏 Agradecimentos

- Comunidade Node.js
- Comunidade React
- Contribuidores do projeto

---

**Última atualização**: 4 de março de 2026  
**Versão**: 1.0.0 🚀
