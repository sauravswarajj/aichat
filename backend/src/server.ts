/**
 * server.ts
 * -----------------------------------------------------------------------------
 * The actual entry point (`npm run dev` / `npm start` both run this file).
 * Connects to MongoDB, THEN starts the HTTP listener — the app never accepts
 * a request until the database is actually reachable. All other config
 * lives in app.ts and config/env.ts.
 * -----------------------------------------------------------------------------
 */

import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { connectDB } from "./config/db";

async function main() {
  await connectDB();

  const app = createApp();

  app.listen(env.PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
    logger.info(`   Health check:        GET   /api/health`);
    logger.info(`   Login:               POST  /api/auth/login`);
    logger.info(`   Logout (device):     POST  /api/auth/logout`);
    logger.info(`   Logout (everywhere): POST  /api/auth/logout-all`);
    logger.info(`   Session check:       GET   /api/auth/me`);
    logger.info(`   List threads:        GET   /api/threads          (requires auth)`);
    logger.info(`   Get thread:          GET   /api/threads/:id      (requires auth)`);
    logger.info(`   New thread:          POST  /api/threads          (requires auth)`);
    logger.info(`   Rename thread:       PATCH /api/threads/:id      (requires auth)`);
    logger.info(`   Delete thread:       DELETE /api/threads/:id     (requires auth)`);
    logger.info(`   Run workflow:        POST  /api/chat             (requires auth)`);
    logger.info(`   Run workflow (SSE):  POST  /api/chat/stream      (requires auth)`);
  });
}

main();
