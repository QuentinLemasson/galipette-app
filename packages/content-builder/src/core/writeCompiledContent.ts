/**
 * Persists compiled entities and companion graph JSON next to each other on disk.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { EntityGraph, SlugIndex } from "@galipette/content-schema";
import type { EntityWithReferences } from "./buildEntityGraph.ts";

export function buildSlugIndex(entities: EntityWithReferences[]): SlugIndex {
  const slugToId: Record<string, string> = {};
  const idToSlug: Record<string, string> = {};
  for (const entity of entities) {
    slugToId[entity.slug] = entity.id;
    idToSlug[entity.id] = entity.slug;
  }
  return { slugToId, idToSlug };
}

/**
 * Writes `entities.json`, `graph.json`, and `slug-index.json` under the output directory.
 *
 * @param entities - Final entity array including references for traceability.
 * @param outputFilePath - Absolute path for the entities artifact file.
 * @param graph - Lightweight nodes and edges derived from the same build pass.
 * @returns The slug/id maps written to `slug-index.json`.
 */
export async function writeCompiledContent(
  entities: EntityWithReferences[],
  outputFilePath: string,
  graph: EntityGraph,
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
  return slugIndex;
}
