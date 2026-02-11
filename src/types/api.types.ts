export interface ApiResponse<T> {
  success: boolean;
  cached?: boolean;
  data: T;
  error?: string;
  timestamp?: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  timestamp: string;
  path?: string;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  timestamp: string;
  version: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  hitRate: string;
  totalKeys: number;
  keys: string[];
}