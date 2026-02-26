/**
 * API Documentation - Parceiro Endpoints
 * @swagger
 * /parceiros:
 *   get:
 *     summary: Lista todos os parceiros
 *     description: Retorna uma lista paginada de todos os parceiros cadastrados
 *     tags:
 *       - Parceiros
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Itens por página
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *           default: '-createdAt'
 *         description: Campo para ordenação (- para descendente)
 *     responses:
 *       200:
 *         description: Lista de parceiros obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Parceiro'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *   post:
 *     summary: Cria novo parceiro
 *     description: Cria um novo parceiro no sistema
 *     tags:
 *       - Parceiros
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Parceiro'
 *           example:
 *             par_nome: "Nova Telecom"
 *             par_dominio: "https://novatelecom.com"
 *             par_cidade: "Brasília"
 *             par_status: "ativo"
 *     responses:
 *       201:
 *         description: Parceiro criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Parceiro'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 * /parceiros/{id}:
 *   get:
 *     summary: Busca parceiro por ID
 *     description: Retorna detalhes de um parceiro específico com suas relações
 *     tags:
 *       - Parceiros
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do parceiro
 *     responses:
 *       200:
 *         description: Parceiro encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Parceiro'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     summary: Atualiza parceiro
 *     description: Atualiza informações de um parceiro existente
 *     tags:
 *       - Parceiros
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               par_nome:
 *                 type: string
 *               par_status:
 *                 type: string
 *                 enum: ['ativo', 'inativo']
 *     responses:
 *       200:
 *         description: Parceiro atualizado com sucesso
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Deleta parceiro
 *     description: Remove um parceiro do sistema
 *     tags:
 *       - Parceiros
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Parceiro deletado com sucesso
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * API Documentation - Tema Endpoints
 * @swagger
 * /temas:
 *   get:
 *     summary: Lista todos os temas
 *     tags:
 *       - Temas
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de temas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tema'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *   post:
 *     summary: Cria novo tema
 *     tags:
 *       - Temas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tema'
 *     responses:
 *       201:
 *         description: Tema criado com sucesso
 * /temas/{id}:
 *   get:
 *     summary: Busca tema por ID
 *     tags:
 *       - Temas
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Tema encontrado
 *   put:
 *     summary: Atualiza tema
 *     tags:
 *       - Temas
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tema'
 *     responses:
 *       200:
 *         description: Tema atualizado
 *   delete:
 *     summary: Deleta tema
 *     tags:
 *       - Temas
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Tema deletado
 */

/**
 * API Documentation - Página Endpoints
 * @swagger
 * /paginas:
 *   get:
 *     summary: Lista todas as páginas
 *     tags:
 *       - Páginas
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de páginas
 *   post:
 *     summary: Cria nova página
 *     tags:
 *       - Páginas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pagina'
 *     responses:
 *       201:
 *         description: Página criada com sucesso
 * /paginas/{id}:
 *   get:
 *     summary: Busca página por ID
 *     tags:
 *       - Páginas
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Página encontrada
 *   put:
 *     summary: Atualiza página
 *     tags:
 *       - Páginas
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pagina'
 *     responses:
 *       200:
 *         description: Página atualizada
 *   delete:
 *     summary: Deleta página
 *     tags:
 *       - Páginas
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Página deletada
 */
