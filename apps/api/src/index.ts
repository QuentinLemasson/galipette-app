import "./env.js";
import { serve } from "@hono/node-server";

import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 3001);
const app = createApp();

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
  console.log(`OpenAPI: http://localhost:${info.port}/openapi.json`);
  console.log(`Swagger UI: http://localhost:${info.port}/docs`);
});
