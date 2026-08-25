import { Router } from "express";
import { prisma } from "../../db/prisma.js";
import { hashPassword, comparePassword } from "../../lib/password.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../lib/tokens.js";
import {
  storeRefreshToken,
  isRefreshTokenValid,
  revokeRefreshToken,
} from "../../lib/refreshTokenStore.js";

export const authRouter = Router();

// Cookies are how we hand the refresh token to the browser. "httpOnly"
// means JavaScript in the browser CANNOT read this cookie (protects
// against XSS attacks stealing it) -- the browser just automatically
// sends it back on requests to our API.
const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days, in milliseconds
};

// Helper: given a user, mint both tokens, store the refresh token, and
// send them back the right way (access token in JSON body, refresh
// token in an httpOnly cookie).
async function issueTokens(res, userId) {
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);
  await storeRefreshToken(userId, refreshToken);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
  return accessToken;
}

// POST /api/v1/auth/register
authRouter.post("/register", async (req, res) => {
  const { email, username, password } = req.body;

  // Basic validation. We'll swap this for a proper library (Zod) once we
  // have more than a couple of fields to validate -- for now, being
  // explicit is actually the clearest way to learn what validation IS.
  if (!email || !username || !password) {
    return res.status(400).json({ error: "email, username, and password are all required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "password must be at least 8 characters" });
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    return res.status(409).json({ error: "email or username already in use" });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, username, passwordHash },
  });

  const accessToken = await issueTokens(res, user.id);
  return res.status(201).json({
    user: { id: user.id, email: user.email, username: user.username },
    accessToken,
  });
});

// POST /api/v1/auth/login
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Deliberately vague error message: we don't want to reveal to an
  // attacker whether it was the email or the password that was wrong.
  if (!user) {
    return res.status(401).json({ error: "invalid email or password" });
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ error: "invalid email or password" });
  }

  const accessToken = await issueTokens(res, user.id);
  return res.json({
    user: { id: user.id, email: user.email, username: user.username },
    accessToken,
  });
});

// POST /api/v1/auth/refresh
// Called automatically by the frontend when an access token has expired,
// to get a new one without making the user log in again.
authRouter.post("/refresh", async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: "no refresh token provided" });
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    return res.status(401).json({ error: "refresh token invalid or expired" });
  }

  const stillValid = await isRefreshTokenValid(payload.sub, token);
  if (!stillValid) {
    return res.status(401).json({ error: "refresh token has been revoked" });
  }

  const accessToken = await issueTokens(res, payload.sub);
  return res.json({ accessToken });
});

// POST /api/v1/auth/logout
authRouter.post("/logout", async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (token) {
    try {
      const payload = verifyRefreshToken(token);
      await revokeRefreshToken(payload.sub);
    } catch {
      // token was already invalid -- nothing to revoke, that's fine
    }
  }
  res.clearCookie(REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);
  return res.status(204).send();
});
