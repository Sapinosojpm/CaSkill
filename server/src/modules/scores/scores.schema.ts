import { z } from "zod";

export const submitScoreSchema = z.object({
  gameId: z.cuid(),
  value: z.number().int().nonnegative(),
  durationSeconds: z.number().int().positive(),
  sessionToken: z.string().min(8),
  lookAwayCount: z.number().int().min(0).optional(),
  faceVisibleRatio: z.number().min(0).max(1).optional(),
  clientMeta: z.record(z.string(), z.unknown()).optional(),
});
