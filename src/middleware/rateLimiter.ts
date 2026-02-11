import rateLimit from 'express-rate-limit';
import { API_CONFIG } from '../config/constants';

/**
 * Rate limiter middleware
 */
export const rateLimiter = rateLimit({
  windowMs: API_CONFIG.RATE_LIMIT_WINDOW,
  max: API_CONFIG.RATE_LIMIT_MAX,
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again later.',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});