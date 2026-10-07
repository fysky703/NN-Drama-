/**
 * In-memory rate limiter for the web process. Suitable for a single instance
 * / development. For production, swap for a Redis-backed limiter behind the
 * same interface. Keyed by ip (phase 4: user id).
 */
const buckets = new Map<string, { windowStart: number; count: number }>();

export async function rateLimited(
  key: string,
  limitPerWindow: number,
  windowMs = 60 * 60 * 1000,
  userId = "anonymous",
): Promise<boolean> {
  const bucketKey = `${userId}:${key}`;
  const now = Date.now();
  const bucket = buckets.get(bucketKey);

  if (!bucket || now - bucket.windowStart >= windowMs) {
    buckets.set(bucketKey, { windowStart: now, count: 1 });
    return false;
  }

  if (bucket.count >= limitPerWindow) {
    return true;
  }

  bucket.count += 1;
  return false;
}