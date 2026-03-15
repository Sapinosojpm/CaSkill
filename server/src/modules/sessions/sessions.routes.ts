import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { validateBody } from "../../middleware/validate.js";
import { endSessionHandler, startSessionHandler } from "./sessions.controller.js";
import { endSessionSchema, startSessionSchema } from "./sessions.schema.js";

export const sessionsRouter = Router();

sessionsRouter.use(authenticate);
sessionsRouter.post("/start", validateBody(startSessionSchema), startSessionHandler);
sessionsRouter.post("/end", validateBody(endSessionSchema), endSessionHandler);
