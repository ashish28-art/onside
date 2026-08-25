import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/health.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";
import { competitionsRouter } from "./modules/competitions/competitions.routes.js";
import { teamsRouter } from "./modules/teams/teams.routes.js";
import { matchesRouter } from "./modules/matches/matches.routes.js";
import { favoritesRouter } from "./modules/favourites/favorites.routes.js";
import { followsRouter } from "./modules/follows/follows.routes.js";
import { watchPartiesRouter } from "./modules/watch-parties/watch-parties.routes.js";
import { predictionsRouter } from "./modules/predictions/predictions.routes.js";
import { leaderboardsRouter } from "./modules/leaderboards/leaderboards.routes.js";
import { initWebsocket } from "./websocket/index.js";

const app = express();

app.use(cors({ origin: env.webOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/competitions", competitionsRouter);
app.use("/api/v1/teams", teamsRouter);
app.use("/api/v1/matches", matchesRouter);
app.use("/api/v1/favorites", favoritesRouter);
app.use("/api/v1/follows", followsRouter);
app.use("/api/v1/watch-parties", watchPartiesRouter);
app.use("/api/v1/predictions", predictionsRouter);
app.use("/api/v1/leaderboards", leaderboardsRouter);

const httpServer = createServer(app);
initWebsocket(httpServer);

httpServer.listen(env.port, () => {
  console.log(`[api] listening on http://localhost:${env.port}`);
});