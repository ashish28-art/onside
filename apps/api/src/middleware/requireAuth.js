import { verifyAccessToken } from "../lib/tokens.js";

// Middleware runs BEFORE your route handler. This one checks for a valid
// access token in the "Authorization" header (format: "Bearer <token>"),
// and if valid, attaches req.userId so every route after this one knows
// who's making the request. If invalid, it stops the request here with
// a 401 -- the route handler never even runs.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization; // e.g. "Bearer eyJhbGciOi..."
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "no access token provided" });
  }

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    next(); // move on to the actual route handler
  } catch {
    return res.status(401).json({ error: "access token invalid or expired" });
  }
}
