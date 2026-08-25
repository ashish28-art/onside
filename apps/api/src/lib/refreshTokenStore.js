import { redis } from "../db/redis.js";

// We store the CURRENT valid refresh token per user in Redis, with an
// expiry that matches the token's own lifetime (30 days). This lets us
// invalidate a refresh token on logout, which a JWT's signature alone
// can never let us do.
const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

function key(userId) {
  return `refresh-token:${userId}`;
}

export async function storeRefreshToken(userId, token) {
  await redis.set(key(userId), token, "EX", THIRTY_DAYS_IN_SECONDS);
}

export async function isRefreshTokenValid(userId, token) {
  const stored = await redis.get(key(userId));
  return stored === token;
}

export async function revokeRefreshToken(userId) {
  await redis.del(key(userId));
}
