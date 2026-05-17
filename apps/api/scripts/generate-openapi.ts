/**
 * Writes OpenAPI 3.0 YAML next to shared DTOs (packages/shared-schemas/openapi/).
 * Does not require a running database. Sets a dummy DATABASE_URL only if missing
 * so Prisma client module can load.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stringify } from "yaml";

process.env.DATABASE_URL ??=
  "postgresql://openapi:openapi@127.0.0.1:5432/_openapi_codegen";
process.env.BETTER_AUTH_SECRET ??= "openapi-codegen-secret-not-for-production";
process.env.DISCORD_CLIENT_ID ??= "openapi-discord-client-id";
process.env.DISCORD_CLIENT_SECRET ??= "openapi-discord-client-secret";

const { createApp } = await import("../src/app.js");

const app = createApp();
const doc = app.getOpenAPIDocument({
  openapi: "3.0.0",
  info: {
    title: "Galipette API",
    version: "0.0.0",
  },
});

const outDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../packages/shared-schemas/openapi",
);
mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "galipette-api.yaml");
writeFileSync(outFile, stringify(doc), "utf8");
console.log(`Wrote ${outFile}`);
