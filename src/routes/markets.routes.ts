import { Router, Request, Response, NextFunction } from 'express';
import injectiveClient from '../services/InjectiveClient.service';
import cacheService from '../services/CacheService.service';
import { simplifyMarketData } from '../utils/calculation';
import { sanitizeLimit } from '../utils/validators';
import { CACHE_TTL, DEFAULT_LIMITS } from '../config/constants';
import { ApiResponse } from '../types/api.types';
import {
  MarketsResponse,
  SimplifiedMarket,
  OrderbookSnapshot,
  MarketSummary,
  Trade,
} from '../types/market.types';

const router = Router();

/**
 * GET /api/markets
 * Get all markets with simplified, developer-friendly format
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'all_markets';
    let markets = cacheService.get<MarketsResponse>(cacheKey);

    if (!markets) {
      const [spotMarkets, derivativeMarkets] = await Promise.all([
        injectiveClient.getSpotMarkets(),
        injectiveClient.getDerivativeMarkets(),
      ]);

      markets = {
        spot: spotMarkets.map(simplifyMarketData),
        derivative: derivativeMarkets.map(simplifyMarketData),
        total: spotMarkets.length + derivativeMarkets.length,
        timestamp: new Date().toISOString(),
      };

      cacheService.set(cacheKey, markets, CACHE_TTL.MARKETS);
    }

    const response: ApiResponse<MarketsResponse> = {
      success: true,
      cached: !!cacheService.get(cacheKey),
      data: markets,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/markets/:marketId
 * Get specific market details
 */
router.get('/:marketId', async (req: Request<{ marketId: string }>, res: Response, next: NextFunction) => {
  try {
    const { marketId } = req.params;
    const cacheKey = `market_${marketId}`;

    let market = cacheService.get<SimplifiedMarket>(cacheKey);

    if (!market) {
      const rawMarket = await injectiveClient.getMarketSummary(marketId);
      market = simplifyMarketData(rawMarket);
      cacheService.set(cacheKey, market, CACHE_TTL.MARKETS);
    }

    const response: ApiResponse<SimplifiedMarket> = {
      success: true,
      cached: !!cacheService.get(cacheKey),
      data: market,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/markets/:marketId/orderbook
 * Get orderbook snapshot with depth analysis
 */
router.get('/:marketId/orderbook', async (req: Request<{marketId : string}>, res: Response, next: NextFunction) => {
  try {
    const { marketId } = req.params;
    const levels = sanitizeLimit(
      req.query.levels,
      DEFAULT_LIMITS.ORDERBOOK_LEVELS,
      100
    );
    const cacheKey = `orderbook_${marketId}_${levels}`;

    let orderbook = cacheService.get<OrderbookSnapshot>(cacheKey);

    if (!orderbook) {
      const rawOrderbook = await injectiveClient.getOrderbook(marketId);

      orderbook = {
        marketId,
        bids: (rawOrderbook.buys_price_level || []).slice(0, levels),
        asks: (rawOrderbook.sells_price_level || []).slice(0, levels),
        timestamp: new Date().toISOString(),
      };

      cacheService.set(cacheKey, orderbook, CACHE_TTL.ORDERBOOK);
    }

    const response: ApiResponse<OrderbookSnapshot> = {
      success: true,
      cached: !!cacheService.get(cacheKey),
      data: orderbook,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/markets/:marketId/trades
 * Get recent trades
 */
router.get('/:marketId/trades', async (req: Request<{ marketId: string }>, res: Response, next: NextFunction) => {
  try {
    const { marketId } = req.params;
    const limit = sanitizeLimit(req.query.limit, DEFAULT_LIMITS.TRADES, 1000);
    const cacheKey = `trades_${marketId}_${limit}`;

    let trades = cacheService.get<Trade[]>(cacheKey);

    if (!trades) {
      trades = await injectiveClient.getTrades(marketId, limit);
      cacheService.set(cacheKey, trades, CACHE_TTL.TRADES);
    }

    const response: ApiResponse<{
      marketId: string;
      trades: Trade[];
      count: number;
      timestamp: string;
    }> = {
      success: true,
      cached: !!cacheService.get(cacheKey),
      data: {
        marketId,
        trades,
        count: trades.length,
        timestamp: new Date().toISOString(),
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/markets/:marketId/summary
 * Get 24h market summary with key metrics
 */
router.get('/:marketId/summary', async (req: Request<{ marketId: string }>, res: Response, next: NextFunction) => {
  try {
    const { marketId } = req.params;
    const cacheKey = `summary_${marketId}`;

    let summary = cacheService.get<MarketSummary>(cacheKey);

    if (!summary) {
      const [market, trades] = await Promise.all([
        injectiveClient.getMarketSummary(marketId),
        injectiveClient.getTrades(marketId, 100),
      ]);

      const volume24h = trades.reduce(
        (sum, t) => sum + parseFloat(t.quantity || '0'),
        0
      );
      const prices = trades
        .map((t) => parseFloat(t.price || '0'))
        .filter((p) => p > 0);

      summary = {
        marketId,
        ticker: market.ticker,
        volume24h: Math.round(volume24h * 100) / 100,
        tradeCount24h: trades.length,
        high24h: prices.length > 0 ? Math.max(...prices) : 0,
        low24h: prices.length > 0 ? Math.min(...prices) : 0,
        lastPrice: prices.length > 0 ? prices[0] : 0,
        timestamp: new Date().toISOString(),
      };

      cacheService.set(cacheKey, summary, CACHE_TTL.ANALYTICS);
    }

    const response: ApiResponse<MarketSummary> = {
      success: true,
      cached: !!cacheService.get(cacheKey),
      data: summary,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;