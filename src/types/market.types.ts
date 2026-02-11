export interface InjectiveMarket {
  market_id: string;
  ticker: string;
  base_denom: string;
  quote_denom: string;
  market_type?: string;
  status?: string;
  min_price_tick_size?: string;
  min_quantity_tick_size?: string;
}

export interface SimplifiedMarket {
  marketId: string;
  ticker: string;
  baseDenom: string;
  quoteDenom: string;
  type: string;
  status: string;
  minPriceTickSize?: string;
  minQuantityTickSize?: string;
}

export interface OrderbookLevel {
  p: string; // price
  q: string; // quantity
}

export interface Orderbook {
  buys_price_level?: OrderbookLevel[];
  sells_price_level?: OrderbookLevel[];
}

export interface Trade {
  price: string;
  quantity: string;
  timestamp?: string;
  trade_id?: string;
  market_id?: string;
}

export interface MarketSummary {
  marketId: string;
  ticker: string;
  volume24h: number;
  tradeCount24h: number;
  high24h: number;
  low24h: number;
  lastPrice: number;
  timestamp: string;
}

export interface OrderbookSnapshot {
  marketId: string;
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  timestamp: string;
}

export interface MarketsResponse {
  spot: SimplifiedMarket[];
  derivative: SimplifiedMarket[];
  total: number;
  timestamp: string;
}