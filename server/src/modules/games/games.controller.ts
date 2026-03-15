import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { getPlayableGameById, getPublicGameById, listPublicGames } from "./games.service.js";

export const listGamesHandler = asyncHandler(async (_req: Request, res: Response) => {
  res.status(200).json({ games: await listPublicGames() });
});

export const getGameHandler = asyncHandler(async (req: Request, res: Response) => {
  const gameId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  res.status(200).json({ game: await getPublicGameById(gameId) });
});

export const playGameHandler = asyncHandler(async (req: Request, res: Response) => {
  const gameId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  res.status(200).json({ game: await getPlayableGameById(gameId) });
});
