import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AppUserRole } from "../types/auth.js";
import { AppError } from "./app-error.js";

type JwtPayload = {
  sub: string;
  email: string;
  role: AppUserRole;
};

export function signAccessToken(user: { id: string; email: string; role: AppUserRole }) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] },
  );
}

export function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }
}
