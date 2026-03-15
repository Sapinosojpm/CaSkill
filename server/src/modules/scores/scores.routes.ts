import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { validateBody } from "../../middleware/validate.js";
import { leaderboardHandler, submitScoreHandler } from "./scores.controller.js";
import { submitScoreSchema } from "./scores.schema.js";

export const scoresRouter = Router();

scoresRouter.post("/submit", authenticate, validateBody(submitScoreSchema), submitScoreHandler);
scoresRouter.get("/leaderboards/:gameId", leaderboardHandler);
