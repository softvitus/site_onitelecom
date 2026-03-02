# 🚀 O Que Falta Implementar no Frontend

**Data:** 1º de março de 2026  
**Status:** Identificadas 124 integrações pendentes  
**Prioridade:** Alta

---

## 📊 Resumo das Lacunas

| Categoria | Endpoints | Serviços | Status |
|-----------|-----------|----------|--------|
| **Temas** | 6 | 1 | ❌ Faltando |
| **Páginas** | 6 | 1 | ❌ Faltando |
| **Componentes** | 6 | 1 | ❌ Faltando |
| **Elementos** | 6 | 1 | ❌ Faltando |
| **Pag-Com-Rel** | 6 | 1 | ❌ Faltando |
| **Com-Ele-Rel** | 6 | 1 | ❌ Faltando |
| **Cores** | 6 | 1 | ❌ Faltando |
| **Imagens** | 6 | 1 | ❌ Faltando |
| **Links** | 6 | 1 | ❌ Faltando |
| **Textos** | 6 | 1 | ❌ Faltando |
| **Conteúdo** | 6 | 1 | ❌ Faltando |
| **Features** | 6 | 1 | ❌ Faltando |
| **Config-Tema** | 6 | 1 | ❌ Faltando |
| **Parceiros (Faltando)** | 2 | 1 | ⚠️ Parcial |
| **Endpoints Públicos** | 4 | - | ❌ Faltando |
| **TOTAL** | **124** | **14** | ❌ |

---

## 1️⃣ TEMAS (6 Endpoints)

### Serviço Necessário: `src/servicos/temas.js`

```javascript
// ❌ NÃO EXISTE

// Deve incluir:
GET    /temas                  → listar(page, limit, filtros)
GET    /temas/:id              → obter(id)
GET    /temas/:id (404)        → validar not found
POST   /temas                  → criar(dados)
PUT    /temas/:id              → atualizar(id, dados)
DELETE /temas/:id              → deletar(id)
```

### Página Necessária: `src/paginas/Temas/TemasPage.jsx`

```jsx
// ❌ NÃO EXISTE

// Deve incluir:
- Listagem com paginação
- Busca/filtros
- Criar novo tema
- Editar tema
- Deletar tema
- Grid ou tabela
```

### Campos Esperados:
```javascript
{
  tem_id: UUID,
  tem_par_id: UUID,           // Parceiro
  tem_nome: string,
  tem_descricao: string,
  tem_status: 'ativo'|'inativo',
  tem_cores: relationship,
  tem_imagens: relationship,
  tem_paginas: relationship,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## 2️⃣ PÁGINAS (6 Endpoints)

### Serviço Necessário: `src/servicos/paginas.js`

```javascript
// ❌ NÃO EXISTE

GET    /paginas                → listar(page, limit)
GET    /paginas/:id            → obter(id)
GET    /paginas/:id (404)      → validar not found
POST   /paginas                → criar(dados)
PUT    /paginas/:id            → atualizar(id, dados)
DELETE /paginas/:id            → deletar(id)
```

### Página Necessária: `src/paginas/Paginas/PaginasPage.jsx`

```jsx
// ❌ NÃO EXISTE

- Listagem com paginação
- Criar página
- Editar página
- Deletar página
- Visualizar componentes da página
```

### Campos Esperados:
```javascript
{
  pag_id: UUID,
  pag_tem_id: UUID,           // Tema
  pag_nome: string,
  pag_titulo: string,
  pag_caminho: string,        // URL path
  pag_status: 'ativo'|'inativo',
  pag_mostrar_no_menu: boolean,
  pag_etiqueta_menu: string,
  pag_icone: string,
  pag_ordem_menu: number
}
```

---

## 3️⃣ COMPONENTES (6 Endpoints)

### Serviço Necessário: `src/servicos/componentes.js`

```javascript
// ❌ NÃO EXISTE

GET    /componentes            → listar(page, limit)
GET    /componentes/:id        → obter(id)
GET    /componentes/:id (404)  → validar not found
POST   /componentes            → criar(dados)
PUT    /componentes/:id        → atualizar(id, dados)
DELETE /componentes/:id        → deletar(id)
```

### Página Necessária: `src/paginas/Componentes/ComponentesPage.jsx`

```jsx
// ❌ NÃO EXISTE

- Listagem com paginação
- Criar componente
- Editar componente
- Deletar componente
- Visualizar elementos do componente
```

---

## 4️⃣ ELEMENTOS (6 Endpoints)

### Serviço Necessário: `src/servicos/elementos.js`

```javascript
// ❌ NÃO EXISTE

GET    /elementos               → listar(page, limit)
GET    /elementos/:id           → obter(id)
GET    /elementos/:id (404)     → validar not found
POST   /elementos               → criar(dados)
PUT    /elementos/:id           → atualizar(id, dados)
DELETE /elementos/:id           → deletar(id)
```

### Página Necessária: `src/paginas/Elementos/ElementosPage.jsx`

```jsx
// ❌ NÃO EXISTE

- Listagem com paginação
- Criar elemento
- Editar elemento
- Deletar elemento
```

---

## 5️⃣ RELACIONAMENTOS PAG-COM-REL (6 Endpoints)

### Serviço Necessário: `src/servicos/pagComRels.js`

```javascript
// ❌ NÃO EXISTE

GET    /pag-com-rels           → listar(page, limit)
GET    /pag-com-rels/:id       → obter(id)
GET    /pag-com-rels/:id (404) → validar not found
POST   /pag-com-rels           → criar(dados) // Associar componente a página
PUT    /pag-com-rels/:id       → atualizar(id, dados)
DELETE /pag-com-rels/:id       → deletar(id) // Desassociar
```

### Página Necessária: `src/paginas/PagComRels/PagComRelsPage.jsx`

```jsx
// ❌ NÃO EXISTE

- Listagem de associações
- Criar associação página-componente
- Editar associação
- Deletar associação
- Reordenar componentes na página
```

---

## 6️⃣ RELACIONAMENTOS COM-ELE-REL (6 Endpoints)

### Serviço Necessário: `src/servicos/comEleRels.js`

```javascript
// ❌ NÃO EXISTE

GET    /com-ele-rels           → listar(page, limit)
GET    /com-ele-rels/:id       → obter(id)
GET    /com-ele-rels/:id (404) → validar not found
POST   /com-ele-rels           → criar(dados) // Associar elemento a componente
PUT    /com-ele-rels/:id       → atualizar(id, dados)
DELETE /com-ele-rels/:id       → deletar(id) // Desassociar
```

### Página Necessária: `src/paginas/ComEleRels/ComEleRelsPage.jsx`

```jsx
// ❌ NÃO EXISTE

- Listagem de associações
- Criar associação componente-elemento
- Editar associação
- Deletar associação
- Reordenar elementos no componente
```

---

## 7️⃣ CORES (6 Endpoints)

### Serviço Necessário: `src/servicos/cores.js`

```javascript
// ❌ NÃO EXISTE

GET    /cores                  → listar(page, limit)
GET    /cores/:id              → obter(id)
GET    /cores/:id (404)        → validar not found
POST   /cores                  → criar(dados)
PUT    /cores/:id              → atualizar(id, dados)
DELETE /cores/:id              → deletar(id)
```

### Página Necessária: `src/paginas/Cores/CoresPage.jsx`

```jsx
// ❌ NÃO EXISTE

- Listagem com paginação
- Criar cor
- Editar cor (preview da cor)
- Deletar cor
```

### Campos Esperados:
```javascript
{
  cor_id: UUID,
  cor_tem_id: UUID,           // Tema
  cor_categoria: string,      // 'primaria', 'secundaria', etc
  cor_nome: string,
  cor_valor: string,          // Valor hex: #FFFFFF
  cor_habilitado: boolean
}
```

---

## 8️⃣ IMAGENS (6 Endpoints)

### Serviço Necessário: `src/servicos/imagens.js`

```javascript
// ❌ NÃO EXISTE

GET    /imagens                → listar(page, limit)
GET    /imagens/:id            → obter(id)
GET    /imagens/:id (404)      → validar not found
POST   /imagens                → criar(dados)
PUT    /imagens/:id            → atualizar(id, dados)
DELETE /imagens/:id            → deletar(id)
```

### Página Necessária: `src/paginas/Imagens/ImagensPage.jsx`

```jsx
// ❌ NÃO EXISTE

- Listagem com paginação
- Upload de imagem
- Editar imagem
- Deletar imagem
- Preview de imagem
```

### Campos Esperados:
```javascript
{
  img_id: UUID,
  img_tem_id: UUID,           // Tema
  img_categoria: string,
  img_nome: string,
  img_valor: string,          // URL ou base64
  img_habilitado: boolean
}
```

---

## 9️⃣ LINKS (6 Endpoints)

### Serviço Necessário: `src/servicos/links.js`

```javascript
// ❌ NÃO EXISTE

GET    /links                  → listar(page, limit)
GET    /links/:id              → obter(id)
GET    /links/:id (404)        → validar not found
POST   /links                  → criar(dados)
PUT    /links/:id              → atualizar(id, dados)
DELETE /links/:id              → deletar(id)
```

### Página Necessária: `src/paginas/Links/LinksPage.jsx`

```jsx
// ❌ NÃO EXISTE

- Listagem com paginação
- Criar link
- Editar link
- Deletar link
```

---

## 🔟 TEXTOS (6 Endpoints)

### Serviço Necessário: `src/servicos/textos.js`

```javascript
// ❌ NÃO EXISTE

GET    /textos                 → listar(page, limit)
GET    /textos/:id             → obter(id)
GET    /textos/:id (404)       → validar not found
POST   /textos                 → criar(dados)
PUT    /textos/:id             → atualizar(id, dados)
DELETE /textos/:id             → deletar(id)
```

### Página Necessária: `src/paginas/Textos/TextosPage.jsx`

```jsx
// ❌ NÃO EXISTE

- Listagem com paginação
- Criar texto
- Editar texto
- Deletar texto
- Internacionalização (i18n)
```

---

## 1️⃣1️⃣ CONTEÚDO (6 Endpoints)

### Serviço Necessário: `src/servicos/conteudos.js`

```javascript
// ❌ NÃO EXISTE

GET    /conteudos              → listar(page, limit)
GET    /conteudos/:id          → obter(id)
GET    /conteudos/:id (404)    → validar not found
POST   /conteudos              → criar(dados)
PUT    /conteudos/:id          → atualizar(id, dados)
DELETE /conteudos/:id          → deletar(id)
```

### Página Necessária: `src/paginas/Conteudos/ConteudosPage.jsx`

```jsx
// ❌ NÃO EXISTE

- Listagem com paginação
- Criar conteúdo
- Editar conteúdo
- Deletar conteúdo
- Editor de conteúdo (rich text)
```

### Campos Esperados:
```javascript
{
  cnt_id: UUID,
  cnt_tem_id: UUID,           // Tema
  cnt_tipo: string,           // 'texto', 'imagem', 'video', etc
  cnt_categoria: string,
  cnt_titulo: string,
  cnt_descricao: string,
  cnt_dados: JSON,            // Dados estruturados
  cnt_ordem: number,
  cnt_habilitado: boolean
}
```

---

## 1️⃣2️⃣ FEATURES (6 Endpoints)

### Serviço Necessário: `src/servicos/features.js`

```javascript
// ❌ NÃO EXISTE

GET    /features               → listar(page, limit)
GET    /features/:id           → obter(id)
GET    /features/:id (404)     → validar not found
POST   /features               → criar(dados)
PUT    /features/:id           → atualizar(id, dados)
DELETE /features/:id           → deletar(id)
```

### Página Necessária: `src/paginas/Features/FeaturesPage.jsx`

```jsx
// ❌ NÃO EXISTE

- Listagem com paginação
- Criar feature
- Editar feature
- Deletar feature
```

---

## 1️⃣3️⃣ CONFIG-TEMA (6 Endpoints)

### Serviço Necessário: `src/servicos/configTemas.js`

```javascript
// ❌ NÃO EXISTE

GET    /config-temas           → listar(page, limit)
GET    /config-temas/:id       → obter(id)
GET    /config-temas/:id (404) → validar not found
POST   /config-temas           → criar(dados)
PUT    /config-temas/:id       → atualizar(id, dados)
DELETE /config-temas/:id       → deletar(id)
```

### Página Necessária: `src/paginas/ConfigTemas/ConfigTemasPage.jsx`

```jsx
// ❌ NÃO EXISTE

- Listagem com paginação
- Criar configuração
- Editar configuração
- Deletar configuração
```

---

## 1️⃣4️⃣ PARCEIROS - Endpoints Faltando (2/7)

### Serviço Existente: `src/servicos/parceiros.js` (parcialmente)

```javascript
// ⚠️ FALTANDO:

❌ GET /parceiros/nearby/:latitude/:longitude      → getNearby(lat, lng)
❌ GET /parceiros/proximos/:latitude/:longitude    → getNearbyPublic(lat, lng)
```

### Métodos a Adicionar:
```javascript
// Em src/servicos/parceiros.js

getNearby: async (latitude, longitude, raio = 50) => {
  // GET /parceiros/nearby/:lat/:lng
  // Retorna parceiros próximos com base em coordenadas
}

getNearbyPublic: async (latitude, longitude, raio = 50) => {
  // GET /public/parceiros/proximos/:lat/:lng (público, sem token)
  // Idem ao anterior mas sem autenticação
}
```

---

## 1️⃣5️⃣ ENDPOINTS PÚBLICOS (4 Endpoints - Sem Autenticação)

### Faltando Implementação Frontend:

```javascript
// ❌ NÃO INTEGRADOS

GET /public/parceiros                               
  → Listar todos os parceiros ativos
  → Sem token requerido
  → Deve ser usado em um frontend público

GET /public/parceiros/:id/tema                     
  → Buscar tema completo de um parceiro
  → Inclui: páginas, componentes, elementos, cores, imagens, textos, links, conteúdos, features
  → Sem token requerido
  → Ideal para aplicação cliente dos parceiros

GET /public/parceiros/proximos/:latitude/:longitude
  → Buscar parceiros próximos às coordenadas
  → Sem token requerido
  → Implementação com mapa/geolocalização

GET /public/parceiros/por-cidade/:cidade          
  → Buscar parceiros por cidade
  → Sem token requerido
```

**Nota:** Estes endpoints são públicos e não requerem autenticação. Devem ser consumidos por um **frontend público separado** ou aplicação cliente dos parceiros.

---

## 📋 Checklist de Implementação

### Por Serviço:
```
[ ] src/servicos/temas.js             (6 endpoints)
[ ] src/servicos/paginas.js            (6 endpoints)
[ ] src/servicos/componentes.js        (6 endpoints)
[ ] src/servicos/elementos.js          (6 endpoints)
[ ] src/servicos/pagComRels.js         (6 endpoints)
[ ] src/servicos/comEleRels.js         (6 endpoints)
[ ] src/servicos/cores.js              (6 endpoints)
[ ] src/servicos/imagens.js            (6 endpoints)
[ ] src/servicos/links.js              (6 endpoints)
[ ] src/servicos/textos.js             (6 endpoints)
[ ] src/servicos/conteudos.js          (6 endpoints)
[ ] src/servicos/features.js           (6 endpoints)
[ ] src/servicos/configTemas.js        (6 endpoints)
[ ] src/servicos/parceiros.js          (+ 2 endpoints: nearby)
```

### Por Página:
```
[ ] src/paginas/Temas/TemasPage.jsx
[ ] src/paginas/Paginas/PaginasPage.jsx
[ ] src/paginas/Componentes/ComponentesPage.jsx
[ ] src/paginas/Elementos/ElementosPage.jsx
[ ] src/paginas/PagComRels/PagComRelsPage.jsx
[ ] src/paginas/ComEleRels/ComEleRelsPage.jsx
[ ] src/paginas/Cores/CoresPage.jsx
[ ] src/paginas/Imagens/ImagensPage.jsx
[ ] src/paginas/Links/LinksPage.jsx
[ ] src/paginas/Textos/TextosPage.jsx
[ ] src/paginas/Conteudos/ConteudosPage.jsx
[ ] src/paginas/Features/FeaturesPage.jsx
[ ] src/paginas/ConfigTemas/ConfigTemasPage.jsx
```

### Endpoints Públicos:
```
[ ] Frontend público ou aplicação cliente para:
    [ ] GET /public/parceiros
    [ ] GET /public/parceiros/:id/tema
    [ ] GET /public/parceiros/proximos/:lat/:lng
    [ ] GET /public/parceiros/por-cidade/:cidade
```

---

## 🎯 Priorização Recomendada

### Fase 1 (MVP - Gerenciamento Básico)
```
1. Temas (6 endpoints)      ← Bloqueia tudo
2. Páginas (6 endpoints)    ← Bloqueia componentes
3. Componentes (6 endpoints) ← Deps: páginas
```

### Fase 2 (Estrutura Completa)
```
4. Elementos (6 endpoints)        ← Deps: componentes
5. Pag-Com-Rel (6 endpoints)      ← Deps: páginas + componentes
6. Com-Ele-Rel (6 endpoints)      ← Deps: componentes + elementos
```

### Fase 3 (Recursos Estáticos)
```
7. Cores (6 endpoints)
8. Imagens (6 endpoints)
9. Links (6 endpoints)
10. Textos (6 endpoints)
```

### Fase 4 (Avançado)
```
11. Conteúdo (6 endpoints)
12. Features (6 endpoints)
13. Config-Tema (6 endpoints)
14. Parceiros - Nearby (2 endpoints)
```

### Fase 5 (Público)
```
15. Frontend Público Para endpoints /public/*
```

---

## 📝 Template para Novo Serviço

```javascript
// src/servicos/[entidade].js
import criarServicoGenerico from './base';

const [Entidade]Service = criarServicoGenerico('/[endpoint]');

export default [Entidade]Service;
```

```jsx
// src/paginas/[Entidade]/[Entidade]Page.jsx
import [Entidade]Service from '../../servicos/[entidade]';
import { useAuth } from '../../hooks/useAuth';
import Grid from '../../componentes/Comum/Grid';

function [Entidade]Page() {
  const { temPermissao } = useAuth();
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);
  
  if (!temPermissao('[entidade]_visualizar')) {
    return <div>Acesso Restrito</div>;
  }
  
  // Implementar CRUD
}

export default [Entidade]Page;
```

---

## 🔄 Total de Pendências

| Item | Quantidade |
|------|-----------|
| Serviços | 14 |
| Páginas | 14 |
| Endpoints | 124 |
| Testes | Cobertos (backend) |

**Status Final:** Pronto para implementação, com 100% dos serviços backend já validados pelos testes Python.

