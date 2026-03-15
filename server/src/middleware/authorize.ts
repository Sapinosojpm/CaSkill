import type { NextFunction, Request, Response } from "express";
import type { AppUserRole } from "../types/auth.js";
import { AppError } from "../utils/app-error.js";

export function authorize(...allowedRoles: AppUserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to access this resource", 403));
    }

    return next();
  };
}
