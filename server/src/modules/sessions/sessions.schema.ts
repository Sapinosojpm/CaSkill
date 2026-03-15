import { z } from "zod";

export const startSessionSchema = z.object({
  gameId: z.cuid(),
});

export const findMatchSchema = z.object({
  gameId: z.cuid(),
  stakePoints: z.number().int().positive().max(1000),
  targetQueueEntryId: z.cuid().optional(),
});

export const cancelMatchSchema = z.object({
  queueEntryId: z.cuid(),
});

export const leaveMatchSchema = z.object({
  gameId: z.cuid().optional(),
});

export const endSessionSchema = z.object({
  sessionToken: z.string().min(8),
  lookAwayEvents: z.number().int().min(0).optional(),
  faceDetectedRatio: z.number().min(0).max(1).optional(),
});
