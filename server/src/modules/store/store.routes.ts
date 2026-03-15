import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { validateBody } from "../../middleware/validate.js";
import {
  createCheckoutSessionHandler,
  getWalletSummaryHandler,
  listPointPackagesHandler,
  listPointTransactionsHandler,
} from "./store.controller.js";
import { createCheckoutSessionSchema } from "./store.schema.js";

export const storeRouter = Router();

storeRouter.get("/packages", listPointPackagesHandler);
storeRouter.get("/wallet", authenticate, authorize("PLAYER"), getWalletSummaryHandler);
storeRouter.get("/transactions", authenticate, authorize("PLAYER"), listPointTransactionsHandler);
storeRouter.post("/checkout-session", authenticate, authorize("PLAYER"), validateBody(createCheckoutSessionSchema), createCheckoutSessionHandler);
