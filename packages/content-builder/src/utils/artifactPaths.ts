/**
 * Resolved paths for compiled JSON artifacts adjacent to `entities.json`.
 */

import { dirname, resolve } from "node:path";

/**
 * Resolves the graph artifact path next to the entities JSON file.
 *
 * @param entitiesJsonPath - Absolute or resolved path to entities.json.
 * @returns Absolute path to graph.json in the same directory.
 */
export function graphPathFromEntitiesPath(entitiesJsonPath: string): string {
  return resolve(dirname(entitiesJsonPath), "graph.json");
}

/**
 * Resolves the slug ↔ id index artifact path next to the entities JSON file.
 *
 * @param entitiesJsonPath - Absolute or resolved path to entities.json.
 * @returns Absolute path to slug-index.json in the same directory.
 */
export function slugIndexPathFromEntitiesPath(entitiesJsonPath: string): string {
  return resolve(dirname(entitiesJsonPath), "slug-index.json");
}
