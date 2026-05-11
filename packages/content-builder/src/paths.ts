/**
 * Default filesystem locations for build logs and compiled outputs (relative to this package).
 */

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = dirname(fileURLToPath(import.meta.url));

/** Markdown error report written when validation fails. */
export const buildErrorLogPath = resolve(moduleDir, "..", "logs", "build-errors.md");

/** Default path for emitted `entities.json` (workspace compiled-content package). */
export const defaultCompiledContentPath = resolve(
  moduleDir,
  "..",
  "..",
  "compiled-content",
  "src",
  "data",
  "entities.json",
);
