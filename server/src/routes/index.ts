import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { adminRouter } from "../modules/admin/admin.routes.js";
import { authRouter } from "../modules/auth/auth.routes.js";
import { creatorRouter } from "../modules/creator/creator.routes.js";
import { gamesRouter } from "../modules/games/games.routes.js";
import { scoresRouter } from "../modules/scores/scores.routes.js";
import { sessionsRouter } from "../modules/sessions/sessions.routes.js";
import { waitlistRouter } from "../modules/waitlist/waitlist.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "ok",
      service: "caskill1-server",
      database: "connected",
    });
  } catch {
    res.status(503).json({
      status: "degraded",
      service: "caskill1-server",
      database: "disconnected",
    });
  }
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/games", gamesRouter);
apiRouter.use("/creator", creatorRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/scores", scoresRouter);
apiRouter.use("/sessions", sessionsRouter);
apiRouter.use("/waitlist", waitlistRouter);
