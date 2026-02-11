export interface LiquidityMetrics {
  score: number;
  bidDepth: number;
  askDepth: number;
  spread: number;
  bestBid: number;
  bestAsk: number;
}

export interface LiquidityData {
  marketId: string;
  ticker: string;
  liquidityScore: number;
  bidDepth: number;
  askDepth: number;
  spread: number;
  timestamp: string;
}

export interface VolatilityMetrics {
  daily: number;
  priceChange: number;
  highLow: {
    high: number;
    low: number;
  };
}

export interface VolatilityData {
  marketId: string;
  ticker: string;
  volatility24h: number;
  priceChange24h: number;
  highLow24h: {
    high: number;
    low: number;
  };
  timestamp: string;
}

export interface VolumeData {
  marketId: string;
  ticker: string;
  volume24h: number;
  tradeCount: number;
}

export interface TrendingMarket {
  marketId: string;
  ticker: string;
  volume24h: number;
  tradeCount: number;
  score: number;
  timestamp: string;
}