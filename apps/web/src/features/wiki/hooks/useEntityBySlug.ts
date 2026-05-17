/**
 * Hook resolving a compiled entity from its public URL `slug`.
 */

import { contentRepository, type CompiledEntity } from "@galipette/compiled-content";
import { useMemo } from "react";

/**
 * @description Looks up a compiled entity by slug (same string as in entity URLs,
 *   without a `.md` suffix). Computation is cached until `slug` changes.
 * @param slug - Public slug path (e.g. `wiki/skills/spells/lightning-arc`).
 * @returns The matching `CompiledEntity`, or `undefined` if none exists.
 */
export function useEntityBySlug(slug: string): CompiledEntity | undefined {
  return useMemo(() => contentRepository.getBySlug(slug), [slug]);
}
