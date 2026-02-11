export const INJECTIVE_ENDPOINTS = {
  REST: 'https://sentry.lcd.injective.network',
  INDEXER: 'https://sentry.exchange.grpc-web.injective.network',
  EXPLORER: 'https://api.injective.network',
} as const;

export const CACHE_TTL = {
  MARKETS: 60, // 60 seconds
  ORDERBOOK: 5, // 5 seconds
  TRADES: 10, // 10 seconds
  ANALYTICS: 300, // 5 minutes
} as const;

export const NETWORK = 'mainnet' as const;

export const MARKET_TYPES = {
  SPOT: 'spot',
  DERIVATIVE: 'derivative',
  PERPETUAL: 'perpetual',
} as const;

export const DEFAULT_LIMITS = {
  TRADES: 50,
  ORDERBOOK_LEVELS: 20,
  MARKETS: 100,
} as const;

export const API_CONFIG = {
  PORT: process.env.PORT || 3000,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100, // max requests per window
  REQUEST_TIMEOUT: 10000, // 10 seconds
} as const;