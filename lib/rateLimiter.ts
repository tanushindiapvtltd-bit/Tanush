// Simple in-memory rate limiter (resets on server restart — good for serverless cold starts too)
const store = new Map<string, { count: number; resetAt: number }>();

/**
 * Returns true if the request is allowed, false if rate-limited.
 * @param key     Identifier (IP address or email)
 * @param limit   Max requests allowed in the window (default 5)
 * @param windowMs  Window duration in ms (default 60 s)
 */
export function checkRateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count++;
  return true;
}
