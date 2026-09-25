import { describe, it, expect } from 'vitest';
import { checkRateLimit } from '../../lib/rate-limit';

describe('Sliding Window Rate Limiter Engine', () => {
  it('allows requests within maxLimit bounds and blocks excess requests', () => {
    const key = `test-ip-${Date.now()}`;
    const options = { intervalMs: 1000, maxRequests: 3 };

    // Request 1, 2, 3 should succeed
    const r1 = checkRateLimit(key, options);
    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = checkRateLimit(key, options);
    expect(r2.success).toBe(true);

    const r3 = checkRateLimit(key, options);
    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(0);

    // Request 4 should be throttled
    const r4 = checkRateLimit(key, options);
    expect(r4.success).toBe(false);
    expect(r4.remaining).toBe(0);
  });
});
