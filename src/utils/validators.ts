/**
 * Validate market ID format
 */
export function isValidMarketId(marketId: string): boolean {
  // Injective market IDs are 66-character hex strings starting with 0x
  return /^0x[a-fA-F0-9]{64}$/.test(marketId);
}

/**
 * Validate positive integer
 */
export function isValidLimit(limit: number, max: number = 1000): boolean {
  return Number.isInteger(limit) && limit > 0 && limit <= max;
}

/**
 * Sanitize and validate query parameters
 */
export function sanitizeLimit(value: any, defaultValue: number, max: number): number {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed <= 0) {
    return defaultValue;
  }
  return Math.min(parsed, max);
}