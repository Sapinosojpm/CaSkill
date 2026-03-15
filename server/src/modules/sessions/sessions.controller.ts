import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { endSession, startSession } from "./sessions.service.js";

export const startSessionHandler = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await startSession(req.user!.id, req.body.gameId));
});

export const endSessionHandler = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({ session: await endSession(req.user!.id, req.body) });
});
