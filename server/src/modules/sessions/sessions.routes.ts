import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { validateBody } from "../../middleware/validate.js";
import {
  cancelMatchHandler,
  endSessionHandler,
  findMatchHandler,
  getMatchStatusHandler,
  startSessionHandler,
} from "./sessions.controller.js";
import { cancelMatchSchema, endSessionSchema, findMatchSchema, startSessionSchema } from "./sessions.schema.js";

export const sessionsRouter = Router();

sessionsRouter.use(authenticate);
sessionsRouter.post("/start", validateBody(startSessionSchema), startSessionHandler);
sessionsRouter.post("/matchmaking/find", validateBody(findMatchSchema), findMatchHandler);
sessionsRouter.get("/matchmaking/:gameId", getMatchStatusHandler);
sessionsRouter.post("/matchmaking/cancel", validateBody(cancelMatchSchema), cancelMatchHandler);
sessionsRouter.post("/end", validateBody(endSessionSchema), endSessionHandler);
