import axios, { AxiosInstance } from 'axios';
import { INJECTIVE_ENDPOINTS, API_CONFIG } from '../config/constants';
import { InjectiveMarket, Orderbook, Trade } from '../types/market.types';

class InjectiveClient {
  private restClient: AxiosInstance;
  private indexerClient: AxiosInstance;

  constructor() {
    this.restClient = axios.create({
      baseURL: INJECTIVE_ENDPOINTS.REST,
      timeout: API_CONFIG.REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.indexerClient = axios.create({
      baseURL: INJECTIVE_ENDPOINTS.INDEXER,
      timeout: API_CONFIG.REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Fetch all spot markets from Injective
   */
  async getSpotMarkets(): Promise<InjectiveMarket[]> {
    try {
      const response = await this.restClient.get<{ markets: InjectiveMarket[] }>(
        '/injective/exchange/v1beta1/spot/markets'
      );
      return response.data.markets || [];
    } catch (error) {
      console.error('Error fetching spot markets:', error);
      throw new Error('Failed to fetch spot markets');
    }
  }

  /**
   * Fetch all derivative markets from Injective
   */
  async getDerivativeMarkets(): Promise<InjectiveMarket[]> {
    try {
      const response = await this.restClient.get<{ markets: InjectiveMarket[] }>(
        '/injective/exchange/v1beta1/derivative/markets'
      );
      return response.data.markets || [];
    } catch (error) {
      console.error('Error fetching derivative markets:', error);
      throw new Error('Failed to fetch derivative markets');
    }
  }

  /**
   * Fetch orderbook for a specific market
   */
  async getOrderbook(marketId: string): Promise<Orderbook> {
    try {
      const response = await this.restClient.get<Orderbook>(
        `/injective/exchange/v1beta1/spot/orderbook/${marketId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching orderbook for ${marketId}:`, error);
      throw new Error('Failed to fetch orderbook');
    }
  }

  /**
   * Fetch recent trades for a market
   */
  async getTrades(marketId: string, limit: number = 50): Promise<Trade[]> {
    try {
      const response = await this.restClient.get<{ trades: Trade[] }>(
        `/injective/exchange/v1beta1/spot/trades/${marketId}`,
        { params: { limit } }
      );
      return response.data.trades || [];
    } catch (error) {
      console.error(`Error fetching trades for ${marketId}:`, error);
      return []; // Return empty array on error
    }
  }

  /**
   * Fetch market summary/details
   */
  async getMarketSummary(marketId: string): Promise<InjectiveMarket> {
    try {
      const response = await this.restClient.get<{ market: InjectiveMarket }>(
        `/injective/exchange/v1beta1/spot/markets/${marketId}`
      );
      return response.data.market || ({} as InjectiveMarket);
    } catch (error) {
      console.error(`Error fetching market summary for ${marketId}:`, error);
      throw new Error('Failed to fetch market summary');
    }
  }
}

export default new InjectiveClient();