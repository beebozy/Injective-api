import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';


import { API_CONFIG } from './config/constants';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

import marketsRouter from './routes/markets.routes';
import analyticsRouter from './routes/analytics.routes';
import healthRouter from './routes/health.routes';

const app: Application = express();
const PORT = API_CONFIG.PORT;

// Security & Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(rateLimiter);

// Routes
app.use('/api/markets', marketsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/health', healthRouter);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Injective Market Intelligence API',
    version: '1.0.0',
    description:
      'Unified TypeScript API for Injective market data with intelligent caching and analytics',
    documentation: '/api/docs',
    endpoints: {
      markets: {
        'GET /api/markets': 'Get all markets with simplified data',
        'GET /api/markets/:marketId': 'Get specific market details',
        'GET /api/markets/:marketId/orderbook': 'Get orderbook snapshot',
        'GET /api/markets/:marketId/trades': 'Get recent trades',
        'GET /api/markets/:marketId/summary': 'Get 24h market summary',
      },
      analytics: {
        'GET /api/analytics/liquidity': 'Get liquidity metrics across markets',
        'GET /api/analytics/volatility': 'Get volatility indicators',
        'GET /api/analytics/volume': 'Get volume analytics',
        'GET /api/analytics/trending': 'Get trending markets',
      },
      health: {
        'GET /api/health': 'API health status',
        'GET /api/health/cache': 'Cache statistics',
      },
    },
    features: [
      'Type-safe TypeScript implementation',
      'Intelligent multi-layer caching (5-300s TTL)',
      'Advanced market analytics',
      'Developer-friendly REST API',
      'Rate limiting & security',
    ],
    github: 'https://github.com/yourusername/injective-market-api',
    author: 'Your Name',
  });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Injective Market Intelligence API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Access at: http://localhost:${PORT}`);
  console.log(`💻 TypeScript: Enabled`);
  console.log(`⚡ Cache: Active`);
});

export default app;
