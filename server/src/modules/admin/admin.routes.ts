import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validateBody } from "../../middleware/validate.js";
import {
  approveSubmissionHandler,
  deleteSubmissionGameHandler,
  getAdminDashboardHandler,
  getAdminSubmissionHandler,
  listAdminSubmissionsHandler,
  listCheatFlagsHandler,
  rejectSubmissionHandler,
  suspendSubmissionGameHandler,
} from "./admin.controller.js";
import { moderationActionSchema, reviewSubmissionSchema } from "./admin.schema.js";

export const adminRouter = Router();

adminRouter.use(authenticate, authorize("ADMIN"));

adminRouter.get("/dashboard", getAdminDashboardHandler);
adminRouter.get("/submissions", listAdminSubmissionsHandler);
adminRouter.get("/submissions/:id", getAdminSubmissionHandler);
adminRouter.post("/submissions/:id/approve", validateBody(reviewSubmissionSchema), approveSubmissionHandler);
adminRouter.post("/submissions/:id/reject", validateBody(reviewSubmissionSchema), rejectSubmissionHandler);
adminRouter.post("/submissions/:id/suspend", validateBody(moderationActionSchema), suspendSubmissionGameHandler);
adminRouter.delete("/submissions/:id", validateBody(moderationActionSchema), deleteSubmissionGameHandler);
adminRouter.get("/cheat-flags", listCheatFlagsHandler);
