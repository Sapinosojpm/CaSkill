import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validateBody } from "../../middleware/validate.js";
import {
  approveSubmissionHandler,
  getAdminDashboardHandler,
  getAdminSubmissionHandler,
  listAdminSubmissionsHandler,
  listCheatFlagsHandler,
  rejectSubmissionHandler,
} from "./admin.controller.js";
import { reviewSubmissionSchema } from "./admin.schema.js";

export const adminRouter = Router();

adminRouter.use(authenticate, authorize("ADMIN"));

adminRouter.get("/dashboard", getAdminDashboardHandler);
adminRouter.get("/submissions", listAdminSubmissionsHandler);
adminRouter.get("/submissions/:id", getAdminSubmissionHandler);
adminRouter.post("/submissions/:id/approve", validateBody(reviewSubmissionSchema), approveSubmissionHandler);
adminRouter.post("/submissions/:id/reject", validateBody(reviewSubmissionSchema), rejectSubmissionHandler);
adminRouter.get("/cheat-flags", listCheatFlagsHandler);
