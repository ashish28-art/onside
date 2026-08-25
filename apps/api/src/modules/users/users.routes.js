import { Router } from "express";
import { prisma } from "../../db/prisma.js";
import { requireAuth } from "../../middleware/requireAuth.js";

export const usersRouter = Router();

// requireAuth runs first. If it calls next(), req.userId is guaranteed to
// be set by the time this handler runs -- that's the whole point of
// middleware: this route doesn't need to know HOW auth works, just that
// it can trust req.userId.
usersRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, username: true, createdAt: true },
    // select: only return these fields -- notice passwordHash is NOT
    // listed, so it can never accidentally leak in an API response.
  });

  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }

  return res.json({ user });
});
