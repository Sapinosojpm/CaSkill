import { z } from "zod";

export const startSessionSchema = z.object({
  gameId: z.cuid(),
});

export const endSessionSchema = z.object({
  sessionToken: z.string().min(8),
  lookAwayEvents: z.number().int().min(0).optional(),
  faceDetectedRatio: z.number().min(0).max(1).optional(),
});
