import { z } from "zod";

export const reviewSubmissionSchema = z.object({
  notes: z.string().trim().min(2).max(500),
});
