import { Server } from "socket.io";
import { verifyAccessToken } from "../lib/tokens.js";
import { redis } from "../db/redis.js";
import { prisma } from "../db/prisma.js";
import { env } from "../config/env.js";

function presenceKey(roomId) {
  return `presence:${roomId}`;
}

export function initWebsocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.webOrigin, credentials: true },
  });

      io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("no access token provided"));
    }
    try {
      const payload = verifyAccessToken(token);
      socket.userId = payload.sub;

      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { username: true },
      });
      socket.username = user?.username || "unknown";

      next();
    } catch {
      next(new Error("access token invalid or expired"));
    }
  });

  io.on("connection", (socket) => {
    let currentRoom = null;

    socket.on("join:room", async ({ roomId }) => {
      if (!roomId) return;
      socket.join(roomId);
      currentRoom = roomId;

      await redis.sadd(presenceKey(roomId), socket.userId);
      const memberCount = await redis.scard(presenceKey(roomId));
      io.to(roomId).emit("presence:update", { count: memberCount });
    });

    socket.on("chat:send", ({ roomId, content }) => {
      if (!roomId || !content?.trim()) return;
            io.to(roomId).emit("chat:message", {
        userId: socket.userId,
        username: socket.username,
        content: content.trim(),
        sentAt: new Date().toISOString(),
      });
    });

    socket.on("typing:start", ({ roomId }) => {
      socket.to(roomId).emit("typing:update", { userId: socket.userId, typing: true });
    });

    socket.on("typing:stop", ({ roomId }) => {
      socket.to(roomId).emit("typing:update", { userId: socket.userId, typing: false });
    });

    socket.on("disconnect", async () => {
      if (!currentRoom) return;
      await redis.srem(presenceKey(currentRoom), socket.userId);
      const memberCount = await redis.scard(presenceKey(currentRoom));
      io.to(currentRoom).emit("presence:update", { count: memberCount });
    });
  });

  return io;
}