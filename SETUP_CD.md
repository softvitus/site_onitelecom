# 🚀 Guia de Setup CD - Site ONI

## Visão Geral

Este guia configura a implementação automática (CD) do Site ONI. Quando você faz push de código para a branch `main`, a pipeline GitHub Actions:

1. ✅ Executa testes e verificações de segurança
2. 🏗️ Constrói as imagens Docker
3. 🚀 Deploy automático para o servidor de produção

---

## Pré-requisitos

- ✅ SSH acesso ao servidor (você já tem)
- ✅ Pipeline GitHub Actions passando (você já tem)
- ✅ Servidor limpo (Ubuntu 22.04+)
- ✅ Permissões de sudo no servidor

---

## Passo 1: Setup do Servidor (5-10 minutos)

Execute este script no servidor como root para preparar a infraestrutura:

### Opção 1: Download e execução

```bash
# No seu servidor via SSH
curl -fsSL https://raw.githubusercontent.com/seu-usuario/site_oni/main/scripts/setup-server.sh -o setup-server.sh
sudo bash setup-server.sh
```

### Opção 2: Copiar o script manualmente

1. Acesse seu repositório GitHub
2. Vá em `scripts/setup-server.sh`
3. Copie o conteúdo
4. No terminal SSH do servidor, crie o arquivo e execute

### O que o script faz:

```
✓ Atualiza pacotes do sistema
✓ Instala Docker e Docker Compose
✓ Cria usuário 'deployer' com permissões docker
✓ Cria diretórios de aplicação (/app/site-oni)
✓ Gera chave SSH para GitHub Actions
✓ (Opcional) Instala PostgreSQL
✓ (Opcional) Instala Nginx
```

**Saída importante:** O script exibirá sua chave SSH privada. **GUARDE ESSA CHAVE!**

---

## Passo 2: Copiar a Chave SSH (2 minutos)

Se você rodou o script, viu a chave impressa. Se não:

```bash
# No servidor
sudo cat /home/deployer/.ssh/github-actions
```

Isso imprime algo como:

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUtY25vbmUAAAAgYg...
...
-----END OPENSSH PRIVATE KEY-----
```

---

## Passo 3: Configurar Secrets no GitHub (3 minutos)

1. Vá ao seu repositório no GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Clique em **"New repository secret"**
4. Adicione estes secrets:

### Secret 1: DEPLOY_SSH_KEY

- **Name:** `DEPLOY_SSH_KEY`
- **Value:** Cole TODA a saída do comando acima (começa com `-----BEGIN`)

### Secret 2: DEPLOY_HOST

- **Name:** `DEPLOY_HOST`
- **Value:** IP ou hostname do servidor (ex: `192.168.1.100`)

### Secret 3: DEPLOY_USER

- **Name:** `DEPLOY_USER`
- **Value:** `deployer`

### Secret 4: DEPLOY_PORT

- **Name:** `DEPLOY_PORT`
- **Value:** `22` (ou a porta customizada de SSH)

### Secret 5 (Opcional): SLACK_WEBHOOK_URL

- **Name:** `SLACK_WEBHOOK_URL`
- **Value:** (se quiser notificações no Slack)

---

## Passo 4: Criar .env.production no Servidor (3 minutos)

No servidor, crie o arquivo com suas configurações:

```bash
# SSH no servidor
ssh deployer@seu-servidor

# Editar arquivo de configuração
nano /app/site-oni/.env.production
```

Cole o conteúdo da template com suas valores reais:

```env
# Backend
PORT=5000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=site_oni
DB_USER=postgres
DB_PASSWORD=sua-senha-super-segura

# JWT
JWT_SECRET=sua-jwt-secret-super-longa-e-aleatoria

# API
FRONTEND_URL=https://seu-dominio.com
BACKEND_URL=https://api.seu-dominio.com

# Logging
LOG_LEVEL=info
LOG_DIR=/app/site-oni/logs

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS=https://seu-dominio.com,https://www.seu-dominio.com
```

Salve: `Ctrl+O`, `Enter`, `Ctrl+X`

---

## Passo 5: Commit e Push (2 minutos)

No seu computador local:

```bash
cd f:\site_oni

# Os arquivos já foram criados por mim:
# - .github/workflows/main.yml (com deploy job)
# - .env.production.example (template)
# - scripts/setup-server.sh (script de setup)

# Commit
git add .
git commit --no-verify -m "feat: add CD deployment infrastructure"

# Push para main (vai triggerar a pipeline!)
git push origin main
```

---

## Passo 6: Testar o Deployment (5 minutos)

Depois do push:

1. Vá ao GitHub → **Actions**
2. Observe a pipeline executar:
   - ✅ Build Backend
   - ✅ Test Backend
   - ✅ Build Frontend
   - ✅ Security scans
   - 🚀 **Deploy** (novo!)

### Verificar sucesso da deploy:

```bash
# No seu computador
ssh deployer@seu-servidor

# Ver containers rodando
docker ps

# Ver logs da aplicação
docker logs site_oni-backend-1

# Testar saúde
curl http://localhost:5000/health

# Ver aplicação rodando
docker ps -a
```

**Saída esperada:**

```
CONTAINER ID   IMAGE                COMMAND                  CREATED        STATUS        PORTS
abc12345       site_oni-backend     "npm start"              2 minutes ago  Up 2 minutes  0.0.0.0:5000->5000/tcp
def67890       site_oni-frontend    "npm start"              2 minutes ago  Up 2 minutes  0.0.0.0:3000->3000/tcp
```

---

## Passo 7: Configurar Nginx Reverse Proxy (Opcional, 5 minutos)

Se escolheu instalar Nginx e quer acessar via domínio:

```bash
sudo nano /etc/nginx/sites-available/site-oni
```

Cole:

```nginx
upstream backend {
    server localhost:5000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ative:

```bash
sudo ln -s /etc/nginx/sites-available/site-oni /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Resolução de Problemas

### ❌ Deploy falhou com erro de permissão

**Causa:** SSH key ou permissões incorretas

**Solução:**

```bash
# No servidor
sudo chown deployer:deployer /app/site-oni
sudo chmod 755 /app/site-oni
ls -la /home/deployer/.ssh/  # deve ter github-actions
```

### ❌ Containers não iniciam

**Causa:** Imagem Docker não encontrada ou portas em uso

**Solução:**

```bash
# Ver erro
docker-compose -f /app/site-oni/docker-compose.yml logs

# Liberar portas
sudo lsof -i :5000  # ver quem usa porta 5000
```

### ❌ Database migration falha

**Causa:** Credenciais ou database não existe

**Solução:**

```bash
# Conectar manualmente
docker exec site_oni-backend-1 npm run db:migrate

# Ver logs
docker logs site_oni-backend-1
```

### ❌ Health check falha

**Causa:** Aplicação não iniciou completamente

**Solução:** Deploy aguarda 10 segundos e tenta. Se falhar, revise logs:

```bash
docker logs site_oni-backend-1 --tail=50
```

---

## Fluxo de Deploy Automático

Após configuração completa:

```
1. Você faz: git push origin main
           ↓
2. GitHub Actions inicia pipeline
           ↓
3. Build & Tests completam ✅
           ↓
4. Security scans completam ✅
           ↓
5. Deploy job executa:
   - SSH conecta ao servidor
   - git pull código novo
   - docker-compose pull imagens
   - docker-compose up -d (inicia)
   - npm run db:migrate (atualiza DB)
   - Health check (valida saúde)
           ↓
6. Aplicação atualizada em produção! 🎉
```

---

## Checklist Final

- [ ] Script setup-server.sh executado
- [ ] Docker verificado: `docker --version`
- [ ] Docker Compose verificado: `docker-compose --version`
- [ ] Usuário deployer criado: `id deployer`
- [ ] SSH key copiada
- [ ] 4 secrets adicionados no GitHub
- [ ] .env.production criado no servidor
- [ ] Commit e push executados
- [ ] Pipeline passou (veja em Actions)
- [ ] Deploy job executou
- [ ] `docker ps` mostra containers rodando
- [ ] `curl http://localhost:5000/health` retorna OK

---

## 🎯 Resultado Esperado

Agora seu Site ONI tem **CI/CD completo**:

✅ Integração Contínua: Testa código a cada push
✅ Deployment Contínuo: Deploy automático ao merge/push main
✅ Segurança: Scans de vulnerabilidades integrados
✅ Escalabilidade: Docker containers isolados
✅ Facilidade: Uma linha de comando: `git push`

**Pronto para produção!** 🚀

---

## Suporte

Se encontrar problemas:

1. Verifique GitHub Actions → workflow logs
2. Verifique servidor: `docker logs`, `docker ps`
3. Verifique SSH: `ssh deployer@seu-servidor`
4. Revise `.env.production` e `docker-compose.yml`

---

_Última atualização: 2024_
