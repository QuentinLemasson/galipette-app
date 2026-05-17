import path from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Shared DB defaults (see packages/database/README.md). */
config({ path: path.join(__dirname, "../../../packages/database/.env") });

/** App-local overrides (e.g. PORT); wins over keys already set from database/.env. */
config({ path: path.join(__dirname, "../.env"), override: true });
