# 🔐 API Documentation

## 📖 Swagger/OpenAPI

A API está documentada com Swagger/OpenAPI. Quando o servidor estiver rodando, acesse:

### **Local Development** (npm start)
```
http://localhost:3000/api-docs
```

### **Docker**
```
http://localhost:5000/api-docs
```

---

## 📝 Estrutura de Documentação

Documentamos endpoints usando JSDoc comments no código. Cada endpoint segue este padrão:

```javascript
/**
 * @swagger
 * /api/v1/endpoint:
 *   get:
 *     summary: Descrição breve
 *     description: Descrição detalhada
 *     tags:
 *       - Categoria
 *     parameters:
 *       - in: query
 *         name: param
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
```

---

## 📂 Onde Documentar

### **Opção 1: Na Rota** (Recomendado para rotas simples)

```javascript
// src/routes/exemplo.js
/**
 * @swagger
 * /api/v1/exemplo:
 *   get:
 *     summary: Obter exemplo
 */
router.get('/exemplo', controller.getExemplo);
```

### **Opção 2: Em Arquivo Dedicado** (Recomendado para APIs complexas)

```javascript
// src/docs/endpoints/exemplo.js
/**
 * @swagger
 * /api/v1/exemplo:
 *   get:
 *     summary: Obter exemplo
 */
```

Depois registrar em `swagger.js`:

```javascript
apis: [
  './src/routes/**/*.js',
  './src/docs/endpoints/**/*.js',  // Seus endpoints
],
```

---

## 🔑 Exemplo Completo

### Endpoint com Autenticação

```javascript
/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login do usuário
 *     description: Autentica usuário e retorna JWT token
 *     tags:
 *       - Authentication
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               senha:
 *                 type: string
 *                 format: password
 *             required:
 *               - email
 *               - senha
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
```

---

## 📊 Schemas Pré-definidos

Use `$ref` para reutilizar schemas:

```javascript
/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
```

Adicione schemas em `swagger.js`:

```javascript
components: {
  schemas: {
    User: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
      },
    },
  },
}
```

---

## 🔒 Autenticação com Bearer Token

Endpoints que requerem autenticação:

```javascript
/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     summary: Dashboard administrativo
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 *       401:
 *         description: Token inválido ou expirado
 */
```

---

## 📚 Referências

- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.3)
- [Swagger JSDoc](https://github.com/Surnet/swagger-jsdoc)
- [Swagger UI Express](https://github.com/scottie1990/swagger-ui-express)

---

## 🚀 Para Adicionar Novo Endpoint

1. **Crie a rota** em `src/routes/**/*.js`
2. **Adicione JSDoc** acima do handler da rota
3. **Teste no Swagger** em `/api-docs`
4. **Valide a documentação** antes de fazer PR

---

**Status**: Em desenvolvimento  
**Última atualização**: 4 de março de 2026
