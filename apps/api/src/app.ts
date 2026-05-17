import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { corsMiddleware } from "./middlewares/cors.js";
import { requireAuth } from "./middlewares/require-auth.js";
import { registerAuthRoutes } from "./routes/auth/register.js";
import { registerCharacterRoutes } from "./routes/characters/register.js";

export function createApp() {
  const app = new OpenAPIHono({
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json(
          { error: result.error.issues.map((i) => i.message).join("; ") },
          400,
        );
      }
    },
  });
  const protectedApi = new OpenAPIHono({
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json(
          { error: result.error.issues.map((i) => i.message).join("; ") },
          400,
        );
      }
    },
  });

  app.use("*", corsMiddleware);

  // Public routes
  registerAuthRoutes(app);
  app.doc("/openapi.json", {
    openapi: "3.0.0",
    info: {
      title: "Galipette API",
      version: "0.0.0",
    },
  });
  app.get("/docs", swaggerUI({ url: "/openapi.json" }));
  app.get("/health", (c) => c.json({ ok: true }));

  // Protected routes
  protectedApi.use("*", requireAuth);
  registerCharacterRoutes(protectedApi);
  app.route("/api", protectedApi);


  return app;
}
