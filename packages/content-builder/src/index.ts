/**
 * CLI entry and programmatic API for compiling vault Markdown into JSON artifacts.
 */
import { loadEnv } from "./loadEnv";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { dirname, resolve } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  graphPathFromEntitiesPath,
  slugIndexPathFromEntitiesPath,
  printCliIntro,
  printConfigSummary,
  printFailure,
  printSuccessSummary,
} from "./cli/cliOutput.ts";
import { scanVault } from "./core/scanVault.ts";
import { parseFile } from "./core/parseFile.ts";
import { validateEntity } from "./core/validateEntity.ts";
import {
  collectObsidianReferences,
  normalizeObsidianFrontmatter,
} from "./core/resolveObsidianLinks.ts";
import { writeCompiledContent } from "./core/writeCompiledContent.ts";
import { buildEntityGraph, type EntityWithReferences } from "./core/buildEntityGraph.ts";
import type { EntityGraph, SlugIndex } from "@galipette/content-schema";

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
type BuildDiagnostics = {
  markdownFilesScanned: number;
  outputFilePath: string;
  slugIndexFilePath: string;
  errorLogPath?: string;
};

/** Result of a successful {@link buildContent} invocation. */
type BuildResult = {
  entities: EntityWithReferences[];
  graph: EntityGraph;
  slugIndex: SlugIndex;
  diagnostics: BuildDiagnostics;
};

const moduleDir = dirname(fileURLToPath(import.meta.url));
const buildErrorLogPath = resolve(moduleDir, "..", "logs", "build-errors.md");
const defaultCompiledContentPath = resolve(
  moduleDir,
  "..",
  "..",
  "compiled-content",
  "src",
  "data",
  "entities.json",
);

/**
 * Resolves vault path and scan subfolder from CLI args, environment variables, or prompts.
 *
 * @param vaultPathArg - Optional vault path from `--vault` or first positional argument.
 * @param subFolderArg - Optional subfolder from `--subfolder` or second positional argument.
 * @returns Resolved {@link BuildContentOptions}.
 */
async function promptForMissingOptions(
  vaultPathArg?: string,
  subFolderArg?: string,
): Promise<BuildContentOptions> {
  const rl = createInterface({ input, output });

  try {
    const envVaultPath = process.env.OBSIDIAN_VAULT_PATH;
    const envSubFolder = process.env.OBSIDIAN_VAULT_SUBFOLDER;

    const vaultPath =
      vaultPathArg ??
      envVaultPath ??
      (
        await rl.question("Enter Obsidian vault absolute path: ")
      ).trim();
    const subFolder =
      subFolderArg ??
      envSubFolder ??
      (await rl.question("Enter vault sub-folder to scan (default: .): ")).trim() ??
      ".";

    if (!vaultPath) {
      throw new Error("Vault path is required.");
    }

    return {
      vaultPath,
      subFolder: subFolder || ".",
    };
  } finally {
    rl.close();
  }
}

/**
 * Scans the vault, validates every Markdown entity, aggregates errors, then writes
 * `entities.json`, `graph.json`, or a consolidated error log under `logs/` on failure.
 *
 * @param options - Vault location, subfolder to scan, and optional output override.
 * @returns Compiled entities, lightweight graph, and diagnostic counters/paths.
 * @throws Error when validation errors occurred; message lists issues and log path.
 */
export async function buildContent(options: BuildContentOptions): Promise<BuildResult> {
  loadEnv();
  const markdownFiles = await scanVault(options.vaultPath, options.subFolder);
  const entities: EntityWithReferences[] = [];
  const knownIds = new Map<string, string>();
  const knownSlugs = new Map<string, string>();
  const errors: string[] = [];

  const outputPath =
    options.outputFilePath ?? defaultCompiledContentPath;
  const errorLogPath = buildErrorLogPath;

  for (const filePath of markdownFiles) {
    try {
      const parsedFile = await parseFile(filePath, options.vaultPath);
      const references = collectObsidianReferences(
        parsedFile.frontmatter,
        parsedFile.content,
      );
      const normalizedFrontmatter = normalizeObsidianFrontmatter(parsedFile.frontmatter);
      const entity = validateEntity(normalizedFrontmatter, parsedFile);

      const firstSeenIn = knownIds.get(entity.id);
      if (firstSeenIn) {
        errors.push(
          `Duplicate id "${entity.id}" in "${parsedFile.sourcePath}" (already used in "${firstSeenIn}").`,
        );
        continue;
      }

      knownIds.set(entity.id, parsedFile.sourcePath);

      const firstSlugFile = knownSlugs.get(entity.slug);
      if (firstSlugFile) {
        errors.push(
          `Duplicate slug "${entity.slug}" in "${parsedFile.sourcePath}" (already used by "${firstSlugFile}").`,
        );
        continue;
      }
      knownSlugs.set(entity.slug, parsedFile.sourcePath);

      entities.push({
        ...entity,
        references,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(message);
    }
  }

  if (errors.length > 0) {
    const content = [
      `# Content Build Errors`,
      ``,
      `Generated at: ${new Date().toISOString()}`,
      `Total errors: ${errors.length}`,
      ``,
      ...errors.map((message, index) => `${index + 1}. ${message}`),
      "",
    ].join("\n");

    await mkdir(dirname(errorLogPath), { recursive: true });
    await writeFile(errorLogPath, content, "utf8");

    throw new Error(
      `Build failed with ${errors.length} error(s).\n${errors
        .map((message, index) => `${index + 1}. ${message}`)
        .join("\n")}\nError log: ${errorLogPath}`,
    );
  }

  const graph: EntityGraph = buildEntityGraph(entities);

  const slugIndex = await writeCompiledContent(entities, outputPath, graph);
  const slugIndexFilePath = slugIndexPathFromEntitiesPath(outputPath);
  return {
    entities,
    graph,
    slugIndex,
    diagnostics: {
      markdownFilesScanned: markdownFiles.length,
      outputFilePath: outputPath,
      slugIndexFilePath,
    },
  };
}

/**
 * Parses optional `--vault` / `--subfolder` flags and positional vault and subfolder args.
 *
 * @param args - Typically `process.argv.slice(2)` when running as CLI.
 * @returns Parsed optional vault and subfolder strings.
 */
function parseCliArgs(args: string[]): { vaultPathArg?: string; subFolderArg?: string } {
  const vaultFlag = args.findIndex((arg) => arg === "--vault");
  const subFolderFlag = args.findIndex((arg) => arg === "--subfolder");

  const vaultPathArg =
    vaultFlag >= 0 ? args[vaultFlag + 1] : args[0];
  const subFolderArg =
    subFolderFlag >= 0 ? args[subFolderFlag + 1] : args[1];

  return { vaultPathArg, subFolderArg };
}

/**
 * How the vault path was obtained (for CLI messaging only).
 */
function vaultConfigurationSource(vaultPathArg?: string): "cli" | "env" | "prompt" {
  if (vaultPathArg) {
    return "cli";
  }
  if (process.env.OBSIDIAN_VAULT_PATH) {
    return "env";
  }
  return "prompt";
}

/**
 * Extracts a written error log path from a thrown build error message, if present.
 */
function errorLogPathFromMessage(message: string): string | undefined {
  const match = message.match(/Error log:\s*(.+?)(?:\r?\n)?$/m);
  return match?.[1]?.trim();
}

/**
 * Runs an interactive or flag-driven build and prints progress to stdout.
 *
 * @returns Resolves when compilation succeeds; rejects on validation failure.
 */
async function runCli(): Promise<void> {
  loadEnv();
  printCliIntro();
  const { vaultPathArg, subFolderArg } = parseCliArgs(process.argv.slice(2));
  const configSource = vaultConfigurationSource(vaultPathArg);
  const options = await promptForMissingOptions(vaultPathArg, subFolderArg);
  printConfigSummary({
    vaultPath: options.vaultPath,
    subFolder: options.subFolder,
    source: configSource,
  });

  const result = await buildContent(options);

  printSuccessSummary({
    markdownFiles: result.diagnostics.markdownFilesScanned,
    entityCount: result.entities.length,
    graphNodeCount: result.graph.nodes.length,
    graphEdgeCount: result.graph.edges.length,
    entitiesJsonPath: result.diagnostics.outputFilePath,
    graphJsonPath: graphPathFromEntitiesPath(result.diagnostics.outputFilePath),
    slugIndexJsonPath: result.diagnostics.slugIndexFilePath,
  });
}

const isExecutedAsScript =
  typeof process.argv[1] === "string" &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

export { generateEntitySlug, getWikiNamespace } from "./core/generateEntitySlug.ts";
export type { SlugIndex } from "@galipette/content-schema";
export { buildSlugIndex } from "./core/writeCompiledContent.ts";

if (isExecutedAsScript) {
  runCli().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    const logPath = error instanceof Error ? errorLogPathFromMessage(message) : undefined;
    printFailure(message, logPath);
    process.exitCode = 1;
  });
}