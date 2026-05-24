/**
 * Hook resolving a compiled entity from its public URL `slug`.
 */

import { contentRepository, type CompiledEntity } from "@galipette/compiled-content";
import { useMemo } from "react";

/**
 * @description Looks up a compiled entity by slug (same string as in `entities.json`,
 *   e.g. `wiki/skills/spells/lightning-arc`). Computation is cached until `slug` changes.
 * @param slug - Compiled slug (typically from {@link decodeEntitySlug}).
 * @returns The matching `CompiledEntity`, or `undefined` if none exists.
 */
export function useEntityBySlug(slug: string): CompiledEntity | undefined {
  return useMemo(() => (slug ? contentRepository.getBySlug(slug) : undefined), [slug]);
}
