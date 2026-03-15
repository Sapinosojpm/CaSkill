import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validateBody } from "../../middleware/validate.js";
import {
  createWaitlistEntryHandler,
  getWaitlistEntriesHandler,
  getWaitlistStatsHandler,
} from "./waitlist.controller.js";
import { createWaitlistEntrySchema } from "./waitlist.schema.js";

export const waitlistRouter = Router();

waitlistRouter.get("/stats", getWaitlistStatsHandler);
waitlistRouter.post("/", validateBody(createWaitlistEntrySchema), createWaitlistEntryHandler);
waitlistRouter.get("/", authenticate, authorize("ADMIN"), getWaitlistEntriesHandler);
