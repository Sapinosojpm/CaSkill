import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { cancelMatchmaking, endSession, findMatchmaking, getMatchmakingStatus, startSession } from "./sessions.service.js";

export const startSessionHandler = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await startSession(req.user!.id, req.body.gameId));
});

export const findMatchHandler = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json(await findMatchmaking(req.user!.id, req.body));
});

export const getMatchStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const gameId = Array.isArray(req.params.gameId) ? req.params.gameId[0] : req.params.gameId;
  const stakePoints = Number(req.query.stakePoints);
  res.status(200).json(await getMatchmakingStatus(req.user!.id, gameId, Number.isNaN(stakePoints) ? undefined : stakePoints));
});

export const cancelMatchHandler = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json(await cancelMatchmaking(req.user!.id, req.body.queueEntryId));
});

export const endSessionHandler = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({ session: await endSession(req.user!.id, req.body) });
});
