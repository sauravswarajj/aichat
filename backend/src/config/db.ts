/**
 * config/db.ts
 * -----------------------------------------------------------------------------
 * Connects to MongoDB Atlas (or any MongoDB instance) via mongoose. Called
 * once from server.ts BEFORE the HTTP listener starts, so the app never
 * accepts a request until the database is actually reachable.
 *
 * EVERYTHING persistent in this app lives in MongoDB now — login sessions
 * (models/session.model.ts) and chat threads (models/thread.model.ts). If
 * you add another feature that needs to remember something across restarts,
 * it goes here too — add a new model file, don't reach for the filesystem.
 * -----------------------------------------------------------------------------
 */

import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info("✅ Connected to MongoDB");
  } catch (err) {
    logger.error("❌ Failed to connect to MongoDB", {
      error: err instanceof Error ? err.message : String(err),
    });
    // Fail fast — nothing in this app works correctly without the database
    // (sessions and threads both live there), so don't start half-broken.
    process.exit(1);
  }
}
