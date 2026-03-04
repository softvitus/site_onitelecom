/**
 * ═════════════════════════════════════════════════════════════════════════════
 * Swagger/OpenAPI Configuration
 * ═════════════════════════════════════════════════════════════════════════════
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ONI Telecom - Site Institucional API',
      version: '1.0.0',
      description:
        'API REST para gerenciamento de conteúdo do site institucional ONI Telecom.\n\n' +
        '**Base URL:** `/api/v1`\n\n' +
        '**Autenticação:** Bearer Token (JWT)\n\n' +
        '**Status:** Em desenvolvimento',
      contact: {
        name: 'ONI Telecom - Dev Team',
        email: 'dev@onitelecom.com.br',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'integer',
              example: 400,
            },
            message: {
              type: 'string',
              example: 'Bad Request',
            },
            details: {
              type: 'object',
              example: {},
            },
          },
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'OK',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
            uptime: {
              type: 'number',
            },
            database: {
              type: 'string',
              example: 'connected',
            },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/**/*.js',
    './src/docs/endpoints/**/*.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
