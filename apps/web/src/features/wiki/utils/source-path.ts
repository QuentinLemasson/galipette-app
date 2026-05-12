/**
 * Helpers for round-tripping an entity public `slug` through the URL splat segment.
 *
 * Slugs look like `wiki/skills/spells/lightning-arc` (no `.md` suffix). They use
 * forward slashes that map to URL path segments; each segment is URL-encoded where
 * needed (spaces, accents, …).
 */

import { ENTITY_ROUTE_PREFIX } from "../../../common/routing/constants";

/**
 * @description Builds the full router URL for an entity detail page from its slug.
 * @param slug - Public slug of the compiled entity (e.g. `wiki/skills/spells/lightning-arc`).
 * @returns URL string usable as a `Link.to`/`href` value.
 */
export function buildEntityHref(slug: string): string {
  const segments = slug
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) => encodeURIComponent(segment));
  return `${ENTITY_ROUTE_PREFIX}/${segments.join("/")}`;
}

/**
 * @description Reconstructs an entity slug from the splat captured by the router.
 * @param splat - Raw `_splat` param from a TanStack Router splat route.
 * @returns Decoded slug matching `CompiledEntity.slug`, or empty string.
 */
export function decodeEntitySlug(splat: string | undefined): string {
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
