/**
 * config/db.ts
 * -----------------------------------------------------------------------------
 * Connects to MongoDB Atlas (or any MongoDB instance) via mongoose. Called
 * once from server.ts BEFORE the HTTP listener starts, so the app never
 * accepts a request until the database is actually reachable.
 * -----------------------------------------------------------------------------
 */

import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

export async function connectDB(): Promise<void> {
  const uri = env.MONGODB_URI || env.DATABASE_URL || "mongodb://localhost:27017/aichat";
  try {
    await mongoose.connect(uri);
    logger.info("✅ Connected to MongoDB");
  } catch (err) {
    logger.error("❌ Failed to connect to MongoDB", {
      error: err instanceof Error ? err.message : String(err),
    });
    process.exit(1);
  }
}
