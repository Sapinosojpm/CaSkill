import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validateBody } from "../../middleware/validate.js";
import {
  getCreatorDashboardHandler,
  getCreatorSubmissionHandler,
  listCreatorSubmissionsHandler,
  submitCreatorSubmissionHandler,
  uploadCreatorGameHandler,
  deleteCreatorSubmissionHandler,
} from "./creator.controller.js";
import { submitSubmissionSchema } from "./creator.schema.js";
import { creatorUploadMiddleware } from "./creator.upload.js";

export const creatorRouter = Router();

creatorRouter.use(authenticate, authorize("CREATOR", "ADMIN"));

creatorRouter.get("/dashboard", getCreatorDashboardHandler);
creatorRouter.post("/games/upload", creatorUploadMiddleware, uploadCreatorGameHandler);
creatorRouter.post("/games/submit", validateBody(submitSubmissionSchema), submitCreatorSubmissionHandler);
creatorRouter.get("/submissions", listCreatorSubmissionsHandler);
creatorRouter.get("/submissions/:id", getCreatorSubmissionHandler);
creatorRouter.delete("/submissions/:id", deleteCreatorSubmissionHandler);
