import { Router, Request, Response } from 'express';
import cacheService from '../services/CacheService.service';
import { HealthResponse, ApiResponse, CacheStats } from '../types/api.types';

const router = Router();

/**
 * GET /api/health
 * API health check
 */
router.get('/', (req: Request, res: Response) => {
  const healthResponse: HealthResponse = {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  };

  res.json(healthResponse);
});

/**
 * GET /api/health/cache
 * Cache statistics
 */
router.get('/cache', (req: Request, res: Response) => {
  const stats = cacheService.getStats();

  const response: ApiResponse<CacheStats> = {
    success: true,
    data: stats,
    timestamp: new Date().toISOString(),
  };

  res.json(response);
});

export default router;