import swaggerJsdoc from 'swagger-jsdoc';
import { API_CONFIG } from './constants';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Injective Market Intelligence API',
      version: '1.0.0',
      description:
        'Unified TypeScript API for Injective market data with analytics and caching',
    },
    servers: [
      {
        url: `http://localhost:${API_CONFIG.PORT}`,
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // this scans your route files
};

export const swaggerSpec = swaggerJsdoc(options);
