import { Router } from "express";
import crypto from "crypto";
import { prisma } from "../../db/prisma.js";
import { requireAuth } from "../../middleware/requireAuth.js";

export const watchPartiesRouter = Router();

function generateInviteCode() {
  return crypto.randomBytes(6).toString("hex");
}

watchPartiesRouter.get("/match/:matchId", async (req, res) => {
  const matchId = Number(req.params.matchId);
  const parties = await prisma.watchParty.findMany({
    where: { matchId, status: "ACTIVE", isPrivate: false },
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ parties });
});

watchPartiesRouter.post("/", requireAuth, async (req, res) => {
  const { matchId, name, isPrivate } = req.body;

  if (!matchId || !name) {
    return res.status(400).json({ error: "matchId and name are required" });
  }

  const watchParty = await prisma.$transaction(async (tx) => {
    const party = await tx.watchParty.create({
      data: {
        matchId,
        hostId: req.userId,
        name,
        isPrivate: Boolean(isPrivate),
        inviteCode: generateInviteCode(),
      },
    });
    await tx.watchPartyMember.create({
      data: { watchPartyId: party.id, userId: req.userId, role: "HOST" },
    });
    return party;
  });

  res.status(201).json({ watchParty });
});

watchPartiesRouter.get("/:id", requireAuth, async (req, res) => {
  const party = await prisma.watchParty.findUnique({
    where: { id: req.params.id },
    include: {
      members: { include: { user: { select: { username: true } } } },
    },
  });

  if (!party) {
    return res.status(404).json({ error: "watch party not found" });
  }

  const isMember = party.members.some((m) => m.userId === req.userId);
  if (party.isPrivate && !isMember) {
    return res.status(403).json({ error: "this room is private -- use an invite link" });
  }

  res.json({ watchParty: party });
});

watchPartiesRouter.post("/:id/join", requireAuth, async (req, res) => {
  const { inviteCode } = req.body;
  const party = await prisma.watchParty.findUnique({ where: { id: req.params.id } });

  if (!party) {
    return res.status(404).json({ error: "watch party not found" });
  }
  if (party.isPrivate && party.inviteCode !== inviteCode) {
    return res.status(403).json({ error: "invalid invite code" });
  }

  try {
    await prisma.watchPartyMember.create({
      data: { watchPartyId: party.id, userId: req.userId },
    });
  } catch (err) {
    if (err.code !== "P2002") throw err;
  }

  res.status(200).json({ joined: true });
});

watchPartiesRouter.post("/:id/leave", requireAuth, async (req, res) => {
  await prisma.watchPartyMember.deleteMany({
    where: { watchPartyId: req.params.id, userId: req.userId },
  });
  res.status(204).send();
});