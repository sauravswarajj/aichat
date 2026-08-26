/**
 * routes/health.routes.ts
 * -----------------------------------------------------------------------------
 * Liveness/readiness check. Mounted at both GET /health (root, for uptime
 * bots that ping the bare domain) and GET /api/health (see app.ts).
 *
 * Point an uptime bot (UptimeRobot, cron-job.org, Render's own health check,
 * etc.) at either URL to ping your Render instance and keep a free-tier
 * service from spinning down on inactivity.
 *
 * Reports MongoDB connection state too, not just "process is running" — a
 * process can be alive while its DB connection is dropped, and you want the
 * bot (and you, checking the response) to actually catch that.
 * -----------------------------------------------------------------------------
 */

import { Router } from "express";
import mongoose from "mongoose";

export const healthRouter = Router();

const mongoStateNames: Record<number, string> = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

healthRouter.get("/", (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbConnected = dbState === 1;

  // 200 as long as the process is up and responding — an uptime bot pinging
  // this to prevent Render from sleeping just needs a fast 2xx. The `database`
  // field still tells you (or a smarter monitor) if Mongo itself is down,
  // without treating that as "service unreachable" for keep-alive purposes.
  res.status(200).json({
    status: "ok",
    uptimeSeconds: Math.floor(process.uptime()),
    database: mongoStateNames[dbState] ?? "unknown",
    databaseConnected: dbConnected,
    timestamp: new Date().toISOString(),
  });
});
