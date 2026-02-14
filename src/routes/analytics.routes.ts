import { Router, Request, Response, NextFunction } from 'express';
import injectiveClient from '../services/InjectiveClient.service';
import analyticsEngine from '../services/AnalyticEngine.service';
import cacheService from '../services/CacheService.service';
import { CACHE_TTL } from '../config/constants';
import { ApiResponse } from '../types/api.types';
import {
  LiquidityData,
  VolatilityData,
  VolumeData,
  TrendingMarket,
} from '../types/analytics.type';

const router = Router();

/**
 * @swagger
 * /api/analytics/liquidity:
 *   get:
 *     summary: Get liquidity metrics
 *     description: Returns liquidity metrics across top spot markets.
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Liquidity metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 cached:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */

/**
 * GET /api/analytics/liquidity
 * Get liquidity metrics across top markets
 */
router.get('/liquidity', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'analytics_liquidity';
    let liquidity = cacheService.get<LiquidityData[]>(cacheKey);

    if (!liquidity) {
      const spotMarkets = await injectiveClient.getSpotMarkets();
      liquidity = await analyticsEngine.calculateLiquidityMetrics(spotMarkets);
      cacheService.set(cacheKey, liquidity, CACHE_TTL.ANALYTICS);
    }

    const response: ApiResponse<LiquidityData[]> = {
      success: true,
      cached: !!cacheService.get(cacheKey),
      data: liquidity,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/analytics/volatility:
 *   get:
 *     summary: Get volatility indicators
 *     description: Returns calculated volatility metrics for spot markets.
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Volatility metrics retrieved successfully
 */

/**
 * GET /api/analytics/volatility
 * Get volatility indicators
 */
router.get('/volatility', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'analytics_volatility';
    let volatility = cacheService.get<VolatilityData[]>(cacheKey);

    if (!volatility) {
      const spotMarkets = await injectiveClient.getSpotMarkets();
      volatility = await analyticsEngine.calculateVolatilityMetrics(spotMarkets);
      cacheService.set(cacheKey, volatility, CACHE_TTL.ANALYTICS);
    }

    const response: ApiResponse<VolatilityData[]> = {
      success: true,
      cached: !!cacheService.get(cacheKey),
      data: volatility,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/analytics/volume:
 *   get:
 *     summary: Get volume analytics
 *     description: Returns 24-hour volume metrics for top markets sorted by volume.
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Volume analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 cached:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       marketId:
 *                         type: string
 *                       ticker:
 *                         type: string
 *                       volume24h:
 *                         type: number
 *                       tradeCount:
 *                         type: number
 */

/**
 * GET /api/analytics/volume
 * Get volume analytics
 */
router.get('/volume', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'analytics_volume';
    let volumeData = cacheService.get<VolumeData[]>(cacheKey);

    if (!volumeData) {
      const spotMarkets = await injectiveClient.getSpotMarkets();
      const volumePromises = spotMarkets.slice(0, 10).map(async (market) => {
        const trades = await injectiveClient.getTrades(market.market_id, 100);
        const volume = trades.reduce(
          (sum, t) => sum + parseFloat(t.quantity || '0'),
          0
        );

        return {
          marketId: market.market_id,
          ticker: market.ticker,
          volume24h: Math.round(volume * 100) / 100,
          tradeCount: trades.length,
        };
      });

      volumeData = await Promise.all(volumePromises);
      volumeData.sort((a, b) => b.volume24h - a.volume24h);

      cacheService.set(cacheKey, volumeData, CACHE_TTL.ANALYTICS);
    }

    const response: ApiResponse<VolumeData[]> = {
      success: true,
      cached: !!cacheService.get(cacheKey),
      data: volumeData,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/analytics/trending:
 *   get:
 *     summary: Get trending markets
 *     description: Returns trending markets based on trading activity and liquidity.
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Trending markets retrieved successfully
 */

/**
 * GET /api/analytics/trending
 * Get trending markets based on activity
 */
router.get('/trending', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'analytics_trending';
    let trending = cacheService.get<TrendingMarket[]>(cacheKey);

    if (!trending) {
      const spotMarkets = await injectiveClient.getSpotMarkets();
      trending = await analyticsEngine.getTrendingMarkets(spotMarkets);
      cacheService.set(cacheKey, trending, CACHE_TTL.ANALYTICS);
    }

    const response: ApiResponse<TrendingMarket[]> = {
      success: true,
      cached: !!cacheService.get(cacheKey),
      data: trending,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;