/**
 * Swagger Configuration
 * Documentação interativa da API
 */

import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Site ONI Backend API',
      version: '1.0.0',
      description:
        'API REST para gerenciamento de temas, páginas e componentes multi-tenant',
      contact: {
        name: 'Dev Team',
        email: 'dev@siteonl.com',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development Server',
      },
      {
        url: 'https://api.siteonl.com/api/v1',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Bearer token JWT para autenticação',
        },
      },
      schemas: {
        Parceiro: {
          type: 'object',
          required: ['par_nome', 'par_dominio', 'par_cidade'],
          properties: {
            par_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único do parceiro',
            },
            par_nome: {
              type: 'string',
              maxLength: 255,
              description: 'Nome do parceiro',
              example: 'Telecom Plus',
            },
            par_dominio: {
              type: 'string',
              format: 'uri',
              description: 'Domínio do parceiro',
              example: 'https://telecomplus.com',
            },
            par_cidade: {
              type: 'string',
              maxLength: 255,
              description: 'Cidade onde o parceiro opera',
              example: 'São Paulo',
            },
            par_status: {
              type: 'string',
              enum: ['ativo', 'inativo'],
              default: 'ativo',
              description: 'Status do parceiro',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data da última atualização',
            },
          },
        },
        Tema: {
          type: 'object',
          required: ['tem_par_id', 'tem_nome'],
          properties: {
            tem_id: {
              type: 'string',
              format: 'uuid',
            },
            tem_par_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID do parceiro',
            },
            tem_nome: {
              type: 'string',
              maxLength: 255,
              example: 'Tema Principal',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Pagina: {
          type: 'object',
          required: [
            'pag_par_id',
            'pag_tem_id',
            'pag_nome',
            'pag_caminho',
            'pag_titulo',
          ],
          properties: {
            pag_id: {
              type: 'string',
              format: 'uuid',
            },
            pag_par_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID do parceiro',
            },
            pag_tem_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID do tema',
            },
            pag_nome: {
              type: 'string',
              maxLength: 255,
              example: 'Home',
            },
            pag_caminho: {
              type: 'string',
              maxLength: 255,
              example: '/home',
            },
            pag_titulo: {
              type: 'string',
              maxLength: 255,
              example: 'Página Inicial',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                },
                statusCode: {
                  type: 'integer',
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                },
              },
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1,
            },
            limit: {
              type: 'integer',
              example: 10,
            },
            total: {
              type: 'integer',
              example: 100,
            },
            pages: {
              type: 'integer',
              example: 10,
            },
            hasMore: {
              type: 'boolean',
              example: true,
            },
          },
        },
      },
      responses: {
        NotFound: {
          description: 'Recurso não encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        Unauthorized: {
          description: 'Não autorizado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ValidationError: {
          description: 'Erro de validação',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
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
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerOptions;
