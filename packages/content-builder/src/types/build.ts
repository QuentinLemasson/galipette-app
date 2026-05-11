/**
 * Options and results for the programmatic {@link buildContent} API.
 */

import type { EntityGraph, SlugIndex } from "@galipette/content-schema";
import type { EntityWithReferences } from "../core/buildEntityGraph.ts";

/** Options for {@link buildContent}. */
export type BuildContentOptions = {
  /** Absolute path to the Obsidian vault root. */
  vaultPath: string;
  /** Folder inside the vault to scan (relative path segments). */
  subFolder: string;
  /** Override output JSON path; defaults to workspace compiled-content package. */
  outputFilePath?: string;
};

/** Summary counters and paths returned alongside compiled artifacts. */
export type BuildDiagnostics = {
  markdownFilesScanned: number;
  outputFilePath: string;
  slugIndexFilePath: string;
  errorLogPath?: string;
};

/** Result of a successful {@link buildContent} invocation. */
export type BuildResult = {
  entities: EntityWithReferences[];
  graph: EntityGraph;
  slugIndex: SlugIndex;
  diagnostics: BuildDiagnostics;
};
