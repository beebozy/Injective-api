import NodeCache from 'node-cache';
import { CACHE_TTL } from '../config/constants';
import { CacheStats } from '../types/api.types';

class CacheService {
  private cache: NodeCache;
  private stats: {
    hits: number;
    misses: number;
    sets: number;
  };

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 60,
      checkperiod: 120,
      useClones: false,
    });

    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
    };
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const value = this.cache.get<T>(key);
    if (value !== undefined) {
      this.stats.hits++;
      return value;
    }
    this.stats.misses++;
    return null;
  }

  /**
   * Set value in cache with TTL
   */
  set<T>(key: string, value: T, ttl: number = CACHE_TTL.MARKETS): boolean {
    this.stats.sets++;
    return this.cache.set(key, value, ttl);
  }

  /**
   * Delete key from cache
   */
  del(key: string): number {
    return this.cache.del(key);
  }

  /**
   * Flush all cache
   */
  flush(): void {
    this.stats = { hits: 0, misses: 0, sets: 0 };
    this.cache.flushAll();
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const keys = this.cache.keys();
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 
      ? ((this.stats.hits / total) * 100).toFixed(2)
      : '0.00';

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      totalKeys: keys.length,
      keys,
    };
  }
}

export default new CacheService();