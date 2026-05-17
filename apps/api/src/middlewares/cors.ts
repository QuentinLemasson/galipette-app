import { cors } from "hono/cors";

import { parseWebOrigins } from "../lib/cors.js";
import { INVITE_HEADER } from "../repositories/invite-tokens.js";

export const corsMiddleware = cors({
  origin: (origin) => {
    const allowed = parseWebOrigins();
    if (!origin) return allowed[0] ?? "";
    return allowed.includes(origin) ? origin : (allowed[0] ?? "");
  },
  allowHeaders: ["Content-Type", "Authorization", "Cookie", INVITE_HEADER],
  allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  exposeHeaders: ["Set-Cookie"],
  credentials: true,
  maxAge: 600,
});
