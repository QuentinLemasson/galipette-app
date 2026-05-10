/**
 * Maps Obsidian wikilink operands / graph edge targets onto compiled entities when possible.
 */

import type { CompiledEntity } from "@galipette/content-schema";

/**
 * Resolves an operand to an entity: exact id match, else unique `.{token}` suffix match,
 * else shortest id among multiple suffix matches (tie-break).
 */
export function resolveReferenceToken(
  token: string,
  entities: readonly CompiledEntity[],
  byId: ReadonlyMap<string, CompiledEntity>,
): CompiledEntity | undefined {
  const direct = byId.get(token);
  if (direct) {
    return direct;
  }

  const suffix = `.${token}`;
  const matches = entities.filter((e) => e.id.endsWith(suffix));
  if (matches.length === 0) {
    return undefined;
  }
  if (matches.length === 1) {
    return matches[0];
  }

  return matches.reduce((a, b) => (a.id.length <= b.id.length ? a : b));
}
