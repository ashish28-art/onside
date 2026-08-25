import { Router } from "express";
import { footballProvider } from "../../integrations/football-provider/client.js";
import { cached } from "../../integrations/football-provider/cache.js";

export const competitionsRouter = Router();

competitionsRouter.get("/", async (req, res) => {
  try {
    const data = await cached("competitions:list", 60 * 60, () =>
      footballProvider.getCompetitions()
    );
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

competitionsRouter.get("/:code/standings", async (req, res) => {
  try {
    const { code } = req.params;
    const data = await cached(`competition:${code}:standings`, 10 * 60, () =>
      footballProvider.getCompetitionStandings(code)
    );
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});
competitionsRouter.get("/:code/matches", async (req, res) => {
  try {
    const { code } = req.params;
    const data = await cached(`competition:${code}:matches`, 5 * 60, () =>
      footballProvider.getCompetitionMatches(code)
    );
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});