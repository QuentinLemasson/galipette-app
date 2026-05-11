/**
 * Main vault scan → validate → write artifacts pipeline.
 */

import { dirname } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import type { CompiledEntity, EntityGraph } from "@galipette/content-schema";
import { loadEnv } from "../loadEnv";
import { scanVault } from "./scanVault.ts";
import { parseFile } from "./parseFile.ts";
import { validateEntity } from "./validateEntity.ts";
import {
  collectObsidianReferencesFromFrontmatter,
  normalizeObsidianFrontmatter,
} from "./resolveObsidianLinks.ts";
import { resolveCompiledEntities } from "@galipette/content-resolver";
import { writeCompiledContent } from "./writeCompiledContent.ts";
import { buildEntityGraph } from "./buildEntityGraph.ts";
import { slugIndexPathFromEntitiesPath } from "../utils/artifactPaths.ts";
import { buildErrorLogPath, defaultCompiledContentPath } from "../paths.ts";
import type { BuildContentOptions, BuildResult } from "../types/build.ts";

/**
 * Scans the vault, validates every Markdown entity, aggregates errors, then writes
 * `entities.json`, `graph.json`, `slug-index.json`, or a consolidated error log under `logs/` on failure.
 *
 * @param options - Vault location, subfolder to scan, and optional output override.
 * @returns Compiled entities, lightweight graph, slug index, and diagnostic counters/paths.
 * @throws Error when validation errors occurred; message lists issues and log path.
 */
export async function buildContent(options: BuildContentOptions): Promise<BuildResult> {
  loadEnv();
  const markdownFiles = await scanVault(options.vaultPath, options.subFolder);
  const validatedEntities: CompiledEntity[] = [];
  const fmOperandsPerEntity: string[][] = [];
  const knownIds = new Map<string, string>();
  const knownSlugs = new Map<string, string>();
  const errors: string[] = [];

  const outputPath = options.outputFilePath ?? defaultCompiledContentPath;
  const errorLogPath = buildErrorLogPath;

  for (const filePath of markdownFiles) {
    try {
      const parsedFile = await parseFile(filePath, options.vaultPath);
      const fmOperands = collectObsidianReferencesFromFrontmatter(parsedFile.frontmatter);
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

      validatedEntities.push(entity);
      fmOperandsPerEntity.push(fmOperands);
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

  const pending = validatedEntities.map((entity, index) => ({
    entity,
    fmOperands: fmOperandsPerEntity[index] ?? [],
  }));
  const entities = resolveCompiledEntities(pending, validatedEntities);

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
