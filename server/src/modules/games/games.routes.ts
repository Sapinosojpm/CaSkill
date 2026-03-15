import { Router } from "express";
import { getGameHandler, listGamesHandler, playGameHandler } from "./games.controller.js";

export const gamesRouter = Router();

gamesRouter.get("/", listGamesHandler);
gamesRouter.get("/:id", getGameHandler);
gamesRouter.get("/:id/play", playGameHandler);
