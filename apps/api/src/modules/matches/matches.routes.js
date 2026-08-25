import { Router } from "express";
import { footballProvider } from "../../integrations/football-provider/client.js";
import { cached } from "../../integrations/football-provider/cache.js";

export const matchesRouter = Router();

matchesRouter.get("/", async (req, res) => {
  try {
    const filters = req.query;
    const cacheKey = `matches:list:${JSON.stringify(filters)}`;
    const data = await cached(cacheKey, 60, () =>
      footballProvider.getMatches(filters)
    );
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

matchesRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await cached(`match:${id}`, 30, () =>
      footballProvider.getMatch(id)
    );
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});