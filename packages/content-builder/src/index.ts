/**
 * CLI entry and programmatic API for compiling vault Markdown into JSON artifacts.
 */

import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { printFailure } from "./cli/cliOutput.ts";
import { errorLogPathFromMessage, runCli } from "./cli/runCli.ts";

export type {
  BuildContentOptions,
  BuildDiagnostics,
  BuildResult,
} from "./types/build.ts";
export { buildContent } from "./core/buildContent.ts";
export { generateEntitySlug, getWikiNamespace } from "./core/generateEntitySlug.ts";
export type { SlugIndex } from "@galipette/content-schema";
export { buildSlugIndex } from "./core/writeCompiledContent.ts";

export { graphPathFromEntitiesPath, slugIndexPathFromEntitiesPath } from "./utils/artifactPaths.ts";

const isExecutedAsScript =
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isExecutedAsScript) {
  runCli().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    const logPath = error instanceof Error ? errorLogPathFromMessage(message) : undefined;
    printFailure(message, logPath);
    process.exitCode = 1;
  });
}
