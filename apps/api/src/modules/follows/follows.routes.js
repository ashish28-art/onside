import { Router } from "express";
import { prisma } from "../../db/prisma.js";
import { requireAuth } from "../../middleware/requireAuth.js";

export const followsRouter = Router();

followsRouter.get("/u/:username", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { username: req.params.username },
    select: {
      id: true,
      username: true,
      createdAt: true,
      favoriteTeams: true,
      _count: { select: { followers: true, following: true } },
    },
  });

  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }

  res.json({ user });
});

followsRouter.post("/:username", requireAuth, async (req, res) => {
  const target = await prisma.user.findUnique({ where: { username: req.params.username } });
  if (!target) {
    return res.status(404).json({ error: "user not found" });
  }
  if (target.id === req.userId) {
    return res.status(400).json({ error: "you can't follow yourself" });
  }

  try {
    await prisma.follow.create({
      data: { followerId: req.userId, followingId: target.id },
    });
    return res.status(201).json({ following: true });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "already following this user" });
    }
    throw err;
  }
});

followsRouter.delete("/:username", requireAuth, async (req, res) => {
  const target = await prisma.user.findUnique({ where: { username: req.params.username } });
  if (!target) {
    return res.status(404).json({ error: "user not found" });
  }

  await prisma.follow.deleteMany({
    where: { followerId: req.userId, followingId: target.id },
  });
  res.status(204).send();
});

followsRouter.get("/:username/is-following", requireAuth, async (req, res) => {
  const target = await prisma.user.findUnique({ where: { username: req.params.username } });
  if (!target) {
    return res.status(404).json({ error: "user not found" });
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId: req.userId, followingId: target.id },
    },
  });
  res.json({ following: Boolean(existing) });
});