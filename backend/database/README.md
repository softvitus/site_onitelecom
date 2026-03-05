# 📦 Database Migrations & Seeds

## 📋 Visão Geral

Este diretório contém todas as migrações e seeds do banco de dados. O gerenciamento é feito via **Knex.js**.

---

## 📂 Estrutura

```
database/
├── migrations/           # Migrações do schema
│   ├── 001_create_parceiro.js
│   ├── 002_create_tema.js
│   ├── ...
│   └── 014_create_config_tema.js
├── seeds/               # Dados iniciais
│   ├── 001_seed_parceiro.js
│   ├── 002_seed_tema.js
│   └── ...
├── migrations.json      # Histórico de migrações
├── knexfile.js          # Configuração do Knex
└── README.md            # Este arquivo
```

---

## 🚀 Executar Migrações

### **Setup Inicial (Criar Schema + Dados)**

```bash
# Rodar todas as migrações
npm run db:migrate

# Semear dados iniciais
npm run db:seed
```

### **Desfazer (Rollback)**

```bash
# Desfazer última migração
npm run db:rollback

# Desfazer todas as migrações
npm run db:reset
```

---

## 📝 Criar Nova Migração

### **1. Gerar arquivo**

```bash
npm run db:make-migration -- nome_da_tabela
```

Exemplo:
```bash
npm run db:make-migration -- criar_usuarios
```

Cria: `migrations/015_criar_usuarios.js`

### **2. Editar arquivo**

```javascript
/**
 * Criar tabela usuarios
 * @param {Knex} knex
 */
exports.up = async (knex) => {
  return knex.schema.createTable('usuarios', (table) => {
    table.increments('id').primary();
    table.string('nome', 255).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('senha', 255).notNullable();
    table.enum('role', ['admin', 'editor', 'viewer']).defaultTo('viewer');
    table.boolean('ativo').defaultTo(true);
    table.timestamps(true, true);
    table.index('email');
  });
};

exports.down = async (knex) => {
  return knex.schema.dropTableIfExists('usuarios');
};
```

### **3. Executar**

```bash
npm run db:migrate
```

---

## 🌱 Criar Novo Seed

### **1. Gerar arquivo**

```bash
npm run db:make-seed -- nome_seed
```

Exemplo:
```bash
npm run db:make-seed -- usuarios_demo
```

Cria: `seeds/005_usuarios_demo.js`

### **2. Editar arquivo**

```javascript
/**
 * Semear usuários de demo
 * @param {Knex} knex
 */
exports.seed = async (knex) => {
  // Limpar tabela existente
  await knex('usuarios').del();

  // Inserir dados
  await knex('usuarios').insert([
    {
      id: 1,
      nome: 'Admin',
      email: 'admin@example.com',
      senha: 'hashed_password',
      role: 'admin',
      ativo: true,
    },
    {
      id: 2,
      nome: 'Editor',
      email: 'editor@example.com',
      senha: 'hashed_password',
      role: 'editor',
      ativo: true,
    },
  ]);
};
```

### **3. Executar**

```bash
npm run db:seed
```

---

## 📊 Schema Atual

### **Tabelas Principais**

| Tabela | Descrição | Status |
|--------|-----------|--------|
| `parceiros` | Empresas parceiras | ✅ Created |
| `temas` | Temas/marcas | ✅ Created |
| `páginas` | Páginas do site | ✅ Created |
| `componentes` | Componentes de UI | ✅ Created |
| `elementos` | Elementos de página | ✅ Created |
| `cores` | Paleta de cores | ✅ Created |
| `imagens` | Gestão de imagens | ✅ Created |
| `links` | Links e URLs | ✅ Created |
| `textos` | Conteúdo textual | ✅ Created |
| `conteudo` | Conteúdo genérico | ✅ Created |
| `features` | Funcionalidades | ✅ Created |
| `config_tema` | Configurações de tema | ✅ Created |
| `permissoes` | Sistema de permissões | ✅ Created |
| `auditoria` | Log de alterações | ✅ Created |

---

## 🔄 Fluxo Recomendado

### **Desenvolvimento Local**

```bash
# 1. Resetar DB (apagar tudo)
npm run db:reset

# 2. Criar schema (rodar migrations)
npm run db:migrate

# 3. Semear dados demo
npm run db:seed

# 4. Iniciar servidor
npm start
```

### **Teste (CI/CD)**

```bash
# Setup test database
npm run db:migrate --env test
npm run db:seed --env test

# Run tests
npm test

# Cleanup
npm run db:rollback --env test
```

### **Produção**

```bash
# Backup antes!
pg_dump dbname > backup.sql

# Aplicar migrações
npm run db:migrate

# NÃO rodar seeds de teste em prod!
```

---

## 🚨 Boas Práticas

### ✅ **SIM**
- Criar migração para CADA mudança de schema
- Nomear migrações descritivamente: `001_create_users`
- Sempre incluir rollback (função `down`)
- Testar rollback antes de deploy
- Usar transações em operações críticas

### ❌ **NÃO**
- Modificar migrações já aplicadas
- Deletar arquivos de migração
- Rodar seeds em produção sem cuidado
- Deixar de fazer backup antes

---

## 💾 Backup & Recovery

### **Fazer Backup**

```bash
# PostgreSQL
pg_dump -U postgres -d site_oni > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar
psql -U postgres -d site_oni < backup.sql
```

### **Ver Histórico**

```bash
# Ver migrações aplicadas
npm run db:status

# Ver seeds executadas
npm run db:seed:status
```

---

## 🔍 Troubleshooting

### **Erro: "Migration already exists"**

```bash
# Verificar migrations.json
cat migrations.json

# Reset se necessário
rm migrations.json
npm run db:migrate
```

### **Erro: "Foreign key constraint failed"**

Ordem de migrações importa! Criar tabelas dependentes DEPOIS:

```javascript
// ❌ ERRADO
criar_posts (depende de usuarios)
criar_usuarios

// ✅ CORRETO
criar_usuarios
criar_posts
```

### **DB está travada**

```bash
# Matar conexões ativas
npm run db:unlock
```

---

## 📚 Referências

- [Knex.js Documentation](https://knexjs.org/)
- [Database Design Basics](https://naveenakashyap.medium.com/database-design-basics-d7a3d5f0e4f1)
- [PostgreSQL Best Practices](https://www.postgresql.org/docs/current/sql-syntax.html)

---

**Última atualização**: 4 de março de 2026  
**Mantido por**: Dev Team
