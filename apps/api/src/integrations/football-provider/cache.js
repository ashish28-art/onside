import { redis } from "../../db/redis.js";

export async function cached(key, ttlSeconds, fetchFn) {
  const existing = await redis.get(key);
  if (existing) {
    return JSON.parse(existing);
  }

  const fresh = await fetchFn();
  await redis.set(key, JSON.stringify(fresh), "EX", ttlSeconds);
  return fresh;
}