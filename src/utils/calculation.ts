import { Orderbook, Trade } from '../types/market.types';
import { 
  LiquidityMetrics, 
  VolatilityMetrics 
} from '../types/analytics.type';
import { SimplifiedMarket, InjectiveMarket } from '../types/market.types';

/**
 * Calculate liquidity metrics from orderbook data
 */
export function calculateLiquidity(orderbook: Orderbook): LiquidityMetrics {
  const buys = orderbook.buys_price_level || [];
  const sells = orderbook.sells_price_level || [];

  const bidDepth = buys.reduce(
    (sum, level) => sum + parseFloat(level.q || '0'),
    0
  );
  const askDepth = sells.reduce(
    (sum, level) => sum + parseFloat(level.q || '0'),
    0
  );

  const bestBid = buys.length > 0 ? parseFloat(buys[0].p || '0') : 0;
  const bestAsk = sells.length > 0 ? parseFloat(sells[0].p || '0') : 0;

  const spread = bestAsk && bestBid 
    ? ((bestAsk - bestBid) / bestBid) * 100 
    : 0;

  // Liquidity score: higher depth + tighter spread = better liquidity
  const totalDepth = bidDepth + askDepth;
  const liquidityScore = spread > 0 ? totalDepth / spread : totalDepth;

  return {
    score: Math.round(liquidityScore * 100) / 100,
    bidDepth: Math.round(bidDepth * 100) / 100,
    askDepth: Math.round(askDepth * 100) / 100,
    spread: Math.round(spread * 10000) / 10000,
    bestBid,
    bestAsk,
  };
}

/**
 * Calculate volatility from trade data
 */
export function calculateVolatility(trades: Trade[]): VolatilityMetrics {
  if (!trades || trades.length === 0) {
    return {
      daily: 0,
      priceChange: 0,
      highLow: { high: 0, low: 0 },
    };
  }

  const prices = trades
    .map((t) => parseFloat(t.price || '0'))
    .filter((p) => p > 0);

  if (prices.length === 0) {
    return {
      daily: 0,
      priceChange: 0,
      highLow: { high: 0, low: 0 },
    };
  }

  const high = Math.max(...prices);
  const low = Math.min(...prices);
  const firstPrice = prices[prices.length - 1];
  const lastPrice = prices[0];

  const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;
  const volatility = ((high - low) / low) * 100;

  return {
    daily: Math.round(volatility * 100) / 100,
    priceChange: Math.round(priceChange * 100) / 100,
    highLow: {
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
    },
  };
}

/**
 * Simplify market data for developer consumption
 */
export function simplifyMarketData(market: InjectiveMarket): SimplifiedMarket {
  return {
    marketId: market.market_id,
    ticker: market.ticker || 'UNKNOWN',
    baseDenom: market.base_denom,
    quoteDenom: market.quote_denom,
    type: market.market_type || 'spot',
    status: market.status || 'active',
    minPriceTickSize: market.min_price_tick_size,
    minQuantityTickSize: market.min_quantity_tick_size,
  };
}