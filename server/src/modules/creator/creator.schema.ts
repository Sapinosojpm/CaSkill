import { z } from "zod";

export const submitSubmissionSchema = z.object({
  submissionId: z.cuid(),
});
