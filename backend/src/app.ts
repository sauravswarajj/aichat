/**
 * app.ts
 * -----------------------------------------------------------------------------
 * Express application factory. Separated from server.ts so supertest can
 * mount it in tests without starting a live HTTP listener.
 * -----------------------------------------------------------------------------
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { apiRouter } from "./routes";
import { healthRouter } from "./routes/health.routes";
import { requestLogger } from "./middleware/requestLogger.middleware";
import { errorHandler } from "./middleware/errorHandler.middleware";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN
        ? env.CORS_ORIGIN.split(",").map((origin: string) => origin.trim())
        : "*",
    })
  );
  // Support image uploads up to 15mb payload size
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));
  app.use(requestLogger);

  // Root-level alias (GET /health, no /api prefix) — some uptime bots and
  // Render's own health check default to pinging the bare domain root.
  app.use("/health", healthRouter);

  app.use("/api", apiRouter);

  // 404 handler for any route not matched above.
  app.use((req, res) => {
    res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
  });

  // Must be the LAST middleware registered.
  app.use(errorHandler);

  return app;
}
