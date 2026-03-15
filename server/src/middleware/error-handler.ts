import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.parse.failed"
  ) {
    return res.status(400).json({
      message: "Malformed JSON request body",
      details:
        env.NODE_ENV === "development" && "body" in error
          ? error.body
          : "Check the request JSON payload.",
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      details: error.details,
    });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      details: error.flatten(),
    });
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  ) {
    return res.status(409).json({
      message: "A record with this value already exists",
      details: "meta" in error ? error.meta : undefined,
    });
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "PrismaClientInitializationError"
  ) {
    return res.status(503).json({
      message: "Database connection is unavailable",
      details:
        env.NODE_ENV === "development" && "message" in error
          ? error.message
          : "Check DATABASE_URL / DIRECT_URL and database availability.",
    });
  }

  console.error(error);

  return res.status(500).json({
    message: "Internal server error",
    details: env.NODE_ENV === "development" ? error : undefined,
  });
}
