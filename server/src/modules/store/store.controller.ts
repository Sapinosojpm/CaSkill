import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  createCheckoutSession,
  getWalletSummary,
  listPointPackages,
  listPointTransactions,
  processStripeWebhook,
} from "./store.service.js";

export const listPointPackagesHandler = asyncHandler(async (_req: Request, res: Response) => {
  res.status(200).json(await listPointPackages());
});

export const getWalletSummaryHandler = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json(await getWalletSummary(req.user!.id));
});

export const listPointTransactionsHandler = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json(await listPointTransactions(req.user!.id));
});

export const createCheckoutSessionHandler = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await createCheckoutSession(req.user!.id, req.body.pointPackageId));
});

export const stripeWebhookHandler = asyncHandler(async (req: Request, res: Response) => {
  const signatureHeader = req.headers["stripe-signature"];
  const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body ?? "");
  res.status(200).json(await processStripeWebhook(rawBody, signature));
});

