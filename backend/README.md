# Site Oni Backend - API

**Status:** ✅ Production Ready | **Version:** 1.0.0

Backend API Node.js com RBAC completo, 108 testes e Docker ready.

## 📚 Features Implementadas

- ✅ **API Documentation** - Swagger UI interativa em `/api-docs`
- ✅ **Health Checks** - `/health`, `/health/ready`, `/health/live`
- ✅ **Load Testing** - K6 scripts para testar performance
- ✅ **Rate Limiting** - Proteção contra abuso (Nginx + Express)

**Ver detalhes em:** [docs/FEATURES_IMPLEMENTADAS.md](docs/FEATURES_IMPLEMENTADAS.md)

### Com Docker (Recomendado)

```bash
make setup          # Setup completo
make logs           # Ver logs
make test           # Rodar testes
```

### Local

```bash
npm install
npm run db:reset
npm run dev
```

---

## 📁 Estrutura

```
backend/
├─ docker/                      # 🐳 Docker config
│  ├─ Dockerfile
│  ├─ docker-compose.yml
│  └─ .dockerignore
├─ src/
│  ├─ __tests__/               # 🧪 108 testes
│  ├─ middleware/
│  ├─ routes/
│  ├─ models/
│  ├─ services/
│  ├─ migrations/
│  ├─ seeders/
│  └─ config/
├─ .env                        # Development
├─ .env.testing                # Testing
├─ .env.prod                   # Production
├─ docker-compose.yml          # 🔗 Proxy → docker/
├─ Makefile                    # 🎯 Comandos
├─ package.json
└─ server.js
```

---

## 🐳 Docker

Arquivos em `docker/`:

```bash
# Desenvolvimento
docker-compose up

# Produção
NODE_ENV=production docker-compose up

# Via Makefile
make up
make down
make logs
```

---

## 🧪 Testes

```bash
make test              # 108 testes
make test-coverage     # Com cobertura

# Detalhes:
✅ 25 autenticação
✅ 25 RBAC
✅ 35 rotas
✅ 23 E2E flows
```

---

## 🎯 Comandos

```bash
make help          # Ver todos
make up            # Iniciar
make down          # Parar
make logs          # Logs
make test          # Testes
make db-reset      # DB reset
```

---

## 🔐 Segurança

- ✅ JWT (7 dias)
- ✅ Bcrypt hashing
- ✅ Account lockout (5 tentativas)
- ✅ RBAC (3 roles × 35 permissions)
- ✅ Data isolation

---

## ⚙️ Ambiente

- `.env` - Dev
- `.env.testing` - Tests
- `.env.prod` - Prod

---

## 📊 API

```
POST   /api/v1/auth/login
GET    /api/v1/usuarios
POST   /api/v1/temas
GET    /api/docs         # Swagger
```

---

## 📞 Suporte

```bash
make help          # Listar comandos
docker-compose ps  # Containers
docker-compose logs # Logs
```

---

**Pronto para produção! 🚀**
