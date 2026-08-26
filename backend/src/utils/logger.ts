/**
 * utils/logger.ts
 * -----------------------------------------------------------------------------
 * A tiny structured logger. Kept deliberately dependency-free for v1.
 *
 * IMPORTANT: Per the project's own security checklist — log provider/model
 * names and request metadata, NEVER log API keys or full prompt/response
 * bodies containing sensitive content.
 * -----------------------------------------------------------------------------
 */

type LogLevel = "info" | "warn" | "error" | "debug";

function timestamp(): string {
  return new Date().toISOString();
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const line = `[${timestamp()}] [${level.toUpperCase()}] ${message}`;
  const payload = meta ? { ...meta } : undefined;

  switch (level) {
    case "error":
      console.error(line, payload ?? "");
      break;
    case "warn":
      console.warn(line, payload ?? "");
      break;
    default:
      console.log(line, payload ?? "");
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => log("debug", message, meta),
};
