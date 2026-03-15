import { z } from "zod";

export const reviewSubmissionSchema = z.object({
  notes: z.string().trim().max(500).default(""),
});

export const moderationActionSchema = z.object({
  notes: z.string().trim().max(500).default(""),
});
