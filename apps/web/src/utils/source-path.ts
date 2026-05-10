/**
 * Helpers for round-tripping a Markdown source path through the URL splat segment.
 *
 * Source paths look like `wiki/skills/spells/lightning-arc.md`. They contain forward
 * slashes that map naturally to URL segments, so we keep them un-encoded for the
 * splat segment, but URL-encode any segment characters that would otherwise need
 * escaping (spaces, accents, ...).
 */

import { ENTITY_ROUTE_PREFIX } from "../types/routing";

/**
 * @description Builds the full router URL for an entity detail page from its source path.
 * @param sourcePath - Relative source path of the compiled entity (e.g. `wiki/.../foo.md`).
 * @returns URL string usable as a `Link.to`/`href` value.
 */
export function buildEntityHref(sourcePath: string): string {
  const segments = sourcePath
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) => encodeURIComponent(segment));
  return `${ENTITY_ROUTE_PREFIX}/${segments.join("/")}`;
}

/**
 * @description Reconstructs an entity source path from the splat captured by the router.
 * @param splat - Raw `_splat` param from a TanStack Router splat route.
 * @returns Decoded source path matching `CompiledEntity.sourcePath`, or empty string.
 */
export function decodeSourcePath(splat: string | undefined): string {
  if (!splat) {
    return "";
  }
  return splat
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    })
    .join("/");
}
