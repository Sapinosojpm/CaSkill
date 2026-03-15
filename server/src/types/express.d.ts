import type { AppUserRole } from "./auth.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: AppUserRole;
        createdAt: Date;
      };
    }
  }
}

export {};
