import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { createWaitlistEntry, getWaitlistEntries, getWaitlistStats } from "./waitlist.service.js";

export const createWaitlistEntryHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await createWaitlistEntry(req.body);
  res.status(201).json(result);
});

export const getWaitlistStatsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const result = await getWaitlistStats();
  res.status(200).json(result);
});

export const getWaitlistEntriesHandler = asyncHandler(async (_req: Request, res: Response) => {
  const result = await getWaitlistEntries();
  res.status(200).json(result);
});
