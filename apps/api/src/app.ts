import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
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

  registerCharacterRoutes(app);

  app.doc("/openapi.json", {
    openapi: "3.0.0",
    info: {
      title: "Galipette API",
      version: "0.0.0",
    },
  });

  app.get("/docs", swaggerUI({ url: "/openapi.json" }));

  app.get("/health", (c) => c.json({ ok: true }));

  return app;
}
