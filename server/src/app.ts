import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { stripeWebhookHandler } from "./modules/store/store.controller.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFound } from "./middleware/not-found.js";
import { apiRouter } from "./routes/index.js";
import { ensureUploadDirectories, uploadRoot } from "./utils/file-system.js";

export function createApp() {
  const app = express();
  void ensureUploadDirectories();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || env.CLIENT_URLS.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error("CORS origin not allowed"));
      },
      credentials: true,
    }),
  );

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      frameguard: false,
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "frame-ancestors": ["'self'", ...env.CLIENT_URLS],
        },
      },
    }),
  );

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.post("/api/store/webhook/stripe", express.raw({ type: "application/json" }), stripeWebhookHandler);
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use("/uploads", express.static(uploadRoot));

  app.use("/api", apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
