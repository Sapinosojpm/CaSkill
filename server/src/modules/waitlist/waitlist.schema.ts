import { z } from "zod";
import type { AppUserRole } from "../../types/auth.js";

const publicRoles = ["PLAYER", "CREATOR"] as const satisfies readonly AppUserRole[];

export const createWaitlistEntrySchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().transform((value) => value.toLowerCase()),
  role: z.enum(publicRoles).default("PLAYER"),
  note: z.string().trim().max(500).optional().transform((value) => value || undefined),
  wantsUpdates: z.boolean().default(true),
});
