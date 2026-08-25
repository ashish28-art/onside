import { Router } from "express";
import { footballProvider } from "../../integrations/football-provider/client.js";
import { cached } from "../../integrations/football-provider/cache.js";

export const teamsRouter = Router();

teamsRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await cached(`team:${id}`, 60 * 60, () =>
      footballProvider.getTeam(id)
    );
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});