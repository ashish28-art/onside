import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { redis } from "../db/redis.js";

export const healthRouter = Router();

// A "health check" endpoint is a common pattern: a simple route that
// confirms the server -- and everything it depends on -- is actually
// working. We'll hit this from the browser to prove M0 is wired up
// correctly before building anything on top of it.
healthRouter.get("/", async (req, res) => {
  const status = { api: "ok", database: "unknown", redis: "unknown" };

  try {
    await prisma.$queryRaw`SELECT 1`;
    status.database = "ok";
  } catch (err) {
    status.database = `error: ${err.message}`;
  }

  try {
    await redis.ping();
    status.redis = "ok";
  } catch (err) {
    status.redis = `error: ${err.message}`;
  }

  const allOk = status.database === "ok" && status.redis === "ok";
  res.status(allOk ? 200 : 500).json(status);
});
