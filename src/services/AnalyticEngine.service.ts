
import injectiveClient from './InjectiveClient.service';
import { calculateVolatility, calculateLiquidity } from '../utils/calculation';
import { 
  LiquidityData, 
  VolatilityData, 
  TrendingMarket 
} from '../types/analytics.type';
import { InjectiveMarket } from '../types/market.types';

class AnalyticsEngine {
  /**
   * Calculate liquidity metrics for top markets
   */
  async calculateLiquidityMetrics(markets: InjectiveMarket[]): Promise<LiquidityData[]> {
    const liquidityData: LiquidityData[] = [];

    // Limit to top 10 markets for performance
    const topMarkets = markets.slice(0, 10);

    for (const market of topMarkets) {
      try {
        const orderbook = await injectiveClient.getOrderbook(market.market_id);
        const liquidity = calculateLiquidity(orderbook);

        liquidityData.push({
          marketId: market.market_id,
          ticker: market.ticker,
          liquidityScore: liquidity.score,
          bidDepth: liquidity.bidDepth,
          askDepth: liquidity.askDepth,
          spread: liquidity.spread,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error(`Error calculating liquidity for ${market.market_id}:`, error);
      }
    }

    return liquidityData.sort((a, b) => b.liquidityScore - a.liquidityScore);
  }

  /**
   * Calculate volatility metrics for top markets
   */
  async calculateVolatilityMetrics(markets: InjectiveMarket[]): Promise<VolatilityData[]> {
    const volatilityData: VolatilityData[] = [];
    const topMarkets = markets.slice(0, 10);

    for (const market of topMarkets) {
      try {
        const trades = await injectiveClient.getTrades(market.market_id, 100);
        const volatility = calculateVolatility(trades);

        volatilityData.push({
          marketId: market.market_id,
          ticker: market.ticker,
          volatility24h: volatility.daily,
          priceChange24h: volatility.priceChange,
          highLow24h: volatility.highLow,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error(`Error calculating volatility for ${market.market_id}:`, error);
      }
    }

    return volatilityData.sort((a, b) => b.volatility24h - a.volatility24h);
  }

  /**
   * Get trending markets based on volume and activity
   */
  async getTrendingMarkets(markets: InjectiveMarket[]): Promise<TrendingMarket[]> {
    const trending: TrendingMarket[] = [];

    for (const market of markets) {
      try {
        const trades = await injectiveClient.getTrades(market.market_id, 100);
        const volume24h = trades.reduce(
          (sum, trade) => sum + parseFloat(trade.quantity || '0'),
          0
        );

        trending.push({
          marketId: market.market_id,
          ticker: market.ticker,
          volume24h,
          tradeCount: trades.length,
          score: volume24h * trades.length, // Simple trending score
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error(`Error calculating trending for ${market.market_id}:`, error);
      }
    }

    return trending
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }
}

export default new AnalyticsEngine();