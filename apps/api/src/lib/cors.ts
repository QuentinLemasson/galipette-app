import { cors } from "hono/cors";
import { INVITE_HEADER } from "../repositories/invite-tokens.js";

/** Browser origins allowed to call the API with credentials (comma-separated `WEB_ORIGIN`). */
export function parseWebOrigins(): string[] {
  return (process.env.WEB_ORIGIN ?? "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}


