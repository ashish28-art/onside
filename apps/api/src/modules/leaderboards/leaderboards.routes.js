import { Router } from "express";
import { prisma } from "../../db/prisma.js";

export const leaderboardsRouter = Router();

leaderboardsRouter.get("/global", async (req, res) => {
  const totals = await prisma.prediction.groupBy({
    by: ["userId"],
    where: { pointsAwarded: { not: null } },
    _sum: { pointsAwarded: true },
    orderBy: { _sum: { pointsAwarded: "desc" } },
    take: 20,
  });

  const userIds = totals.map((t) => t.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, username: true },
  });
  const usernameById = Object.fromEntries(users.map((u) => [u.id, u.username]));

  const leaderboard = totals.map((t) => ({
    username: usernameById[t.userId],
    points: t._sum.pointsAwarded,
  }));

  res.json({ leaderboard });
});