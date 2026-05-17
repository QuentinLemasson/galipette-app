/**
 * Readonly maps derived from compiled entities for fast lookups.
 */

import type { CompiledEntity } from "@galipette/content-schema";

export function buildByIdMap(entities: readonly CompiledEntity[]): Map<string, CompiledEntity> {
  return new Map(entities.map((entity) => [entity.id, entity]));
}

export function buildBySlugMap(entities: readonly CompiledEntity[]): Map<string, CompiledEntity> {
  return new Map(entities.map((entity) => [entity.slug, entity]));
}

export function buildIdsByType(entities: readonly CompiledEntity[]): Map<string, string[]> {
  const idsByType = new Map<string, string[]>();
  for (const entity of entities) {
    const bucket = idsByType.get(entity.type);
    if (bucket) {
      bucket.push(entity.id);
    } else {
      idsByType.set(entity.type, [entity.id]);
    }
  }
  return idsByType;
}

/** Reference token → entity ids that cite it in `references`. */
export function buildReferencerIdsByToken(
  entities: readonly CompiledEntity[],
): Map<string, string[]> {
  const referencerIdsByToken = new Map<string, string[]>();
  for (const entity of entities) {
    for (const ref of entity.references) {
      const token = ref.operand;
      const list = referencerIdsByToken.get(token);
      if (list) {
        list.push(entity.id);
      } else {
        referencerIdsByToken.set(token, [entity.id]);
      }
    }
  }
  return referencerIdsByToken;
}
