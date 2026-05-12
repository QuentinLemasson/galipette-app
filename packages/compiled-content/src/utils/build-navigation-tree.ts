/**
 * Builds a lightweight navigation tree from compiled entities (no body content / specific data).
 */

import type { CompiledEntity } from "@galipette/content-schema";

/**
 * Minimal entity descriptor suitable for navigation menus and link rendering.
 * Excludes Markdown body and type-specific `data` payload.
 */
export type NavigationEntry = {
  id: string;
  type: CompiledEntity["type"];
  name: string;
  /** Public path segment used in `/entity/...` URLs (no `.md` suffix). */
  slug: string;
  sourcePath: string;
};

/**
 * One navigation category, gathering every entry that shares a `type` discriminator.
 */
export type NavigationCategory = {
  type: CompiledEntity["type"];
  entries: NavigationEntry[];
};

/**
 * @description Reduces compiled entities to a sorted, type-grouped navigation tree.
 *   Categories are sorted alphabetically by `type`; entries within a category are
 *   sorted alphabetically by `name` (locale-aware).
 * @param entities - Source set of compiled entities to project.
 * @returns Sorted readonly list of navigation categories carrying minimal entries.
 */
export function buildNavigationTree(
  entities: readonly CompiledEntity[],
): readonly NavigationCategory[] {
  const entriesByType = new Map<string, NavigationEntry[]>();

  for (const entity of entities) {
    const entry: NavigationEntry = {
      id: entity.id,
      type: entity.type,
      name: entity.name,
      slug: entity.slug,
      sourcePath: entity.sourcePath,
    };
    const bucket = entriesByType.get(entity.type);
    if (bucket) {
      bucket.push(entry);
    } else {
      entriesByType.set(entity.type, [entry]);
    }
  }

  return Array.from(entriesByType.entries())
    .map(([type, entries]) => ({
      type,
      entries: entries.slice().sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.type.localeCompare(b.type)) as readonly NavigationCategory[];
}
