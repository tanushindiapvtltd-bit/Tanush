import { Redis } from "@upstash/redis";

// Singleton Upstash Redis client
export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL ?? "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
});

// ── Helpers ────────────────────────────────────────────────────────────────

/** Cache a pincode serviceability result for 24 hours */
export async function cachePincode(
    pincode: string,
    data: Record<string, unknown>
): Promise<void> {
    await redis.set(`pincode:${pincode}`, data, { ex: 86400 });
}

/** Get cached pincode result, returns null if not cached */
export async function getCachedPincode(
    pincode: string
): Promise<Record<string, unknown> | null> {
    return redis.get<Record<string, unknown>>(`pincode:${pincode}`);
}

/** Increment tracking request counter for an IP (60s window), returns new count */
export async function incrementTrackingCount(ip: string): Promise<number> {
    const key = `track_ip:${ip}`;
    const count = await redis.incr(key);
    if (count === 1) {
        // Set TTL only on first request (1 minute window)
        await redis.expire(key, 60);
    }
    return count;
}

/** Get current tracking request count for IP */
export async function getTrackingCount(ip: string): Promise<number> {
    const val = await redis.get<number>(`track_ip:${ip}`);
    return val ?? 0;
}
