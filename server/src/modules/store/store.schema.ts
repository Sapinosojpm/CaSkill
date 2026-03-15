import { z } from "zod";

export const createCheckoutSessionSchema = z.object({
  pointPackageId: z.cuid(),
});

