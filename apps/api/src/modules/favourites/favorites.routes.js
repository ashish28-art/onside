import { Router } from "express";
import { prisma } from "../../db/prisma.js";
import { requireAuth } from "../../middleware/requireAuth.js";

export const favoritesRouter = Router();

favoritesRouter.get("/teams", requireAuth, async (req, res) => {
  const favorites = await prisma.favoriteTeam.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
  });
  res.json({ favorites });
});

favoritesRouter.post("/teams", requireAuth, async (req, res) => {
  const { teamId, teamName, crestUrl } = req.body;

  if (!teamId || !teamName) {
    return res.status(400).json({ error: "teamId and teamName are required" });
  }

  try {
    const favorite = await prisma.favoriteTeam.create({
      data: { userId: req.userId, teamId, teamName, crestUrl },
    });
    return res.status(201).json({ favorite });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "already following this team" });
    }
    throw err;
  }
});

favoritesRouter.delete("/teams/:teamId", requireAuth, async (req, res) => {
  const teamId = Number(req.params.teamId);
  await prisma.favoriteTeam.deleteMany({
    where: { userId: req.userId, teamId },
  });
  res.status(204).send();
});