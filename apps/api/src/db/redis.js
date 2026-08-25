import Redis from "ioredis";
import { env } from "../config/env.js";

// Redis is a super-fast in-memory store. We're not using it for anything
// yet in M0 -- this just proves we can connect. Later it'll hold things
// like "who is currently online in this chat room" or "cached match data",
// things that change constantly and don't need the durability of Postgres.
export const redis = new Redis(env.redisUrl);

redis.on("error", (err) => {
  console.error("[redis] connection error:", err.message);
});
