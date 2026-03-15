import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { validateBody } from "../../middleware/validate.js";
import {
  cancelMatchHandler,
  endSessionHandler,
  findMatchHandler,
  getMatchStatusHandler,
  leaveActiveMatchHandler,
  listOpenQueuesHandler,
  startSessionHandler,
} from "./sessions.controller.js";
import { cancelMatchSchema, endSessionSchema, findMatchSchema, leaveMatchSchema, startSessionSchema } from "./sessions.schema.js";

export const sessionsRouter = Router();

sessionsRouter.use(authenticate);
sessionsRouter.post("/start", validateBody(startSessionSchema), startSessionHandler);
sessionsRouter.post("/matchmaking/find", validateBody(findMatchSchema), findMatchHandler);
sessionsRouter.get("/matchmaking/:gameId", getMatchStatusHandler);
sessionsRouter.get("/matchmaking/:gameId/open", listOpenQueuesHandler);
sessionsRouter.post("/matchmaking/cancel", validateBody(cancelMatchSchema), cancelMatchHandler);
sessionsRouter.post("/matchmaking/leave", validateBody(leaveMatchSchema), leaveActiveMatchHandler);
sessionsRouter.post("/end", validateBody(endSessionSchema), endSessionHandler);
