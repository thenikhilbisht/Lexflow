/**
 * Sliding window token bucket rate limiter for API endpoints
 */

interface RateLimitConfig {
  intervalMs: number;
  maxRequests: number;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitRecord>();

// Cleanup stale rate limit entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { intervalMs: 60 * 1000, maxRequests: 60 }
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = store.get(identifier);

  if (!record || now > record.resetTime) {
    const newReset = now + config.intervalMs;
    store.set(identifier, { count: 1, resetTime: newReset });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: newReset
    };
  }

  if (record.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime
    };
  }

  record.count += 1;
  return {
    success: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime
  };
}
