/**
 * Persists compiled entities and companion graph JSON next to each other on disk.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type {
  BrokenWikiLinkRecord,
  CompiledEntity,
  EntityGraph,
  SlugIndex,
} from "@galipette/content-schema";

export function buildSlugIndex(entities: CompiledEntity[]): SlugIndex {
  const slugToId: Record<string, string> = {};
  const idToSlug: Record<string, string> = {};
  for (const entity of entities) {
    slugToId[entity.slug] = entity.id;
    idToSlug[entity.id] = entity.slug;
  }
  return { slugToId, idToSlug };
}

/**
 * Writes `entities.json`, `graph.json`, `slug-index.json`, and `broken-links.json` under the output directory.
 *
 * @param entities - Final entity array including references for traceability.
 * @param outputFilePath - Absolute path for the entities artifact file.
 * @param graph - Lightweight nodes and edges derived from the same build pass.
 * @param brokenWikiLinks - Flat list of unresolved wiki operands (debugging).
 * @returns The slug/id maps written to `slug-index.json`.
 */
export async function writeCompiledContent(
  entities: CompiledEntity[],
  outputFilePath: string,
  graph: EntityGraph,
  brokenWikiLinks: readonly BrokenWikiLinkRecord[],
): Promise<SlugIndex> {
  const slugIndex = buildSlugIndex(entities);
  const outDir = dirname(outputFilePath);
  await mkdir(outDir, { recursive: true });
  await writeFile(outputFilePath, JSON.stringify(entities, null, 2), "utf8");
  await writeFile(
    resolve(outDir, "graph.json"),
    JSON.stringify(graph, null, 2),
    "utf8",
  );
  await writeFile(
    resolve(outDir, "slug-index.json"),
    JSON.stringify(slugIndex, null, 2),
    "utf8",
  );
  await writeFile(
    resolve(outDir, "broken-links.json"),
    JSON.stringify(brokenWikiLinks, null, 2),
    "utf8",
  );
  return slugIndex;
}
