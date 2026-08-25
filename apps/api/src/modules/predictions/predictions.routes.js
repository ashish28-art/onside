import { Router } from "express";
import { prisma } from "../../db/prisma.js";
import { requireAuth } from "../../middleware/requireAuth.js";
import { footballProvider } from "../../integrations/football-provider/client.js";
import { evaluateAll } from "./scoring.js";

export const predictionsRouter = Router();

const VALID_WINNERS = ["HOME", "AWAY", "DRAW"];

predictionsRouter.post("/", requireAuth, async (req, res) => {
  const { matchId, predictedWinner, predictedHomeScore, predictedAwayScore } = req.body;

  if (
    !matchId ||
    !VALID_WINNERS.includes(predictedWinner) ||
    predictedHomeScore == null ||
    predictedAwayScore == null
  ) {
    return res.status(400).json({ error: "matchId, predictedWinner, and both scores are required" });
  }

  const match = await footballProvider.getMatch(matchId);
  if (match.status !== "SCHEDULED" && match.status !== "TIMED") {
    return res.status(400).json({ error: "this match has already started -- too late to predict" });
  }

  try {
    const prediction = await prisma.prediction.create({
      data: {
        userId: req.userId,
        matchId,
        predictedWinner,
        predictedHomeScore,
        predictedAwayScore,
      },
    });
    return res.status(201).json({ prediction });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "you've already predicted this match" });
    }
    throw err;
  }
});

predictionsRouter.get("/me", requireAuth, async (req, res) => {
  const predictions = await prisma.prediction.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
  });

  const evaluated = await evaluateAll(predictions);
  res.json({ predictions: evaluated });
});

predictionsRouter.get("/match/:matchId", requireAuth, async (req, res) => {
  const prediction = await prisma.prediction.findUnique({
    where: {
      userId_matchId: { userId: req.userId, matchId: Number(req.params.matchId) },
    },
  });
  res.json({ prediction: prediction || null });
});