import { z } from "zod";
import type { AppUserRole } from "../../types/auth.js";

const publicRoles = ["PLAYER", "CREATOR"] as const satisfies readonly AppUserRole[];

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(8)
    .max(100)
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/[0-9]/, "Password must include a number"),
  role: z.enum(publicRoles).default("PLAYER"),
});

export const loginSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(1),
});
