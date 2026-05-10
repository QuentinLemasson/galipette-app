/**
 * Builds a lightweight directed graph from compiled entities and their reference lists.
 */

import type { CompiledEntity, EntityGraph, GraphNode } from "@galipette/content-schema";

/** Compiled entity augmented with outgoing reference ids from link extraction. */
export type EntityWithReferences = CompiledEntity & { references: string[] };

/**
 * Produces sorted stub nodes (id, type, label, sourcePath) and deduped directed edges.
 *
 * @param entities - Fully validated entities including `references` from each file.
 * @returns Graph suitable for JSON serialization alongside full entity payloads.
 */
export function buildEntityGraph(entities: EntityWithReferences[]): EntityGraph {
  const nodes: GraphNode[] = entities
    .map((entity) => ({
      id: entity.id,
      type: entity.type,
      label: entity.name,
      sourcePath: entity.sourcePath,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const edgeKeys = new Set(
    entities.flatMap((entity) =>
      entity.references.map((targetId) => `${entity.id}\u0000${targetId}`),
    ),
  );

  const edges = Array.from(edgeKeys)
    .map((key) => {
      const [from, to] = key.split("\u0000");
      return [from, to] as [string, string];
    })
    .sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));

  return { nodes, edges };
}
