/**
 * ═════════════════════════════════════════════════════════════════════════════
 * Health Check Endpoints Documentation
 * ═════════════════════════════════════════════════════════════════════════════
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificar saúde da API
 *     description: Retorna o status de saúde da API, incluindo conexão com banco de dados
 *     tags:
 *       - Health
 *     security: []
 *     responses:
 *       200:
 *         description: API está operacional
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *       503:
 *         description: Serviço indisponível
 */

/**
 * @swagger
 * /api/v1:
 *   get:
 *     summary: Informações da API
 *     description: Retorna versão e informações gerais da API
 *     tags:
 *       - Info
 *     security: []
 *     responses:
 *       200:
 *         description: Informações da API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 name:
 *                   type: string
 *                   example: "ONI Telecom API"
 *                 status:
 *                   type: string
 *                   example: "operational"
 */

module.exports = {};
