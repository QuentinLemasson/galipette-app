import { createMiddleware } from "hono/factory";
import { auth } from "../lib/auth.js";
import type { AuthVariables } from "../types/hono-env.js";

export const requireAuth = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const result = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!result) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", result.user);
  c.set("session", result.session);
  await next();
});
