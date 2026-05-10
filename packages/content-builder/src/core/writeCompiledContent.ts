/**
 * Persists compiled entities and companion graph JSON next to each other on disk.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { EntityGraph } from "@galipette/content-schema";
import type { EntityWithReferences } from "./buildEntityGraph.ts";

/**
 * Writes `entities.json` and sibling `graph.json` under the output directory.
 *
 * @param entities - Final entity array including references for traceability.
 * @param outputFilePath - Absolute path for the entities artifact file.
 * @param graph - Lightweight nodes and edges derived from the same build pass.
 * @returns Promise resolved after both files are flushed.
 */
export async function writeCompiledContent(
  entities: EntityWithReferences[],
  outputFilePath: string,
  graph: EntityGraph,
): Promise<void> {
  await mkdir(dirname(outputFilePath), { recursive: true });
  await writeFile(outputFilePath, JSON.stringify(entities, null, 2), "utf8");
  await writeFile(
    resolve(dirname(outputFilePath), "graph.json"),
    JSON.stringify(graph, null, 2),
    "utf8",
  );
}
