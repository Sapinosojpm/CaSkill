import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { getLeaderboard, submitScore } from "./scores.service.js";

export const submitScoreHandler = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({
    score: await submitScore(req.user!.id, req.body),
  });
});

export const leaderboardHandler = asyncHandler(async (req: Request, res: Response) => {
  const gameId = Array.isArray(req.params.gameId) ? req.params.gameId[0] : req.params.gameId;
  res.status(200).json({
    leaderboard: await getLeaderboard(gameId),
  });
});
