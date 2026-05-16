import type { OpenAPIHono } from "@hono/zod-openapi";
import { auth } from "../../lib/auth.js";

export function registerAuthRoutes(app: OpenAPIHono) {
  app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));
}
