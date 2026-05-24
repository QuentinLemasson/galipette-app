/**
 * Helpers for round-tripping compiled entity slugs through `/app/wiki/$` splat URLs.
 *
 * Compiled slugs include the vault namespace (e.g. `wiki/skills/spells/lightning-arc`).
 * URLs mount under {@link ENTITY_ROUTE_PREFIX} and omit that segment from the path.
 */

import { ENTITY_ROUTE_PREFIX } from "../../../common/routing/constants";

const WIKI_NAMESPACE_SEGMENT = "wiki";

/**
 * @description Path segment after `/app/wiki/` (no leading `wiki/`).
 * @param compiledSlug - `CompiledEntity.slug` from compiled content.
 */
export function slugToUrlPath(compiledSlug: string): string {
  if (compiledSlug === WIKI_NAMESPACE_SEGMENT) {
    return "";
  }
  if (compiledSlug.startsWith(`${WIKI_NAMESPACE_SEGMENT}/`)) {
    return compiledSlug.slice(WIKI_NAMESPACE_SEGMENT.length + 1);
  }
  return compiledSlug;
}

/**
 * @description Reconstructs the compiled slug used by {@link contentRepository.getBySlug}.
 * @param urlPath - Decoded splat from the wiki route (no `wiki/` prefix).
 */
export function urlPathToCompiledSlug(urlPath: string): string {
  const trimmed = urlPath.trim();
  if (!trimmed) {
    return "";
  }
  if (trimmed === WIKI_NAMESPACE_SEGMENT || trimmed.startsWith(`${WIKI_NAMESPACE_SEGMENT}/`)) {
    return trimmed;
  }
  return `${WIKI_NAMESPACE_SEGMENT}/${trimmed}`;
}

/**
 * @description Builds the full router URL for an entity detail page from its compiled slug.
 * @param compiledSlug - Public slug of the compiled entity (e.g. `wiki/skills/spells/lightning-arc`).
 * @returns URL string usable as a `Link.to`/`href` value.
 */
export function buildEntityHref(compiledSlug: string): string {
  const pathSlug = slugToUrlPath(compiledSlug);
  const segments = pathSlug
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) => encodeURIComponent(segment));
  if (segments.length === 0) {
    return ENTITY_ROUTE_PREFIX;
  }
  return `${ENTITY_ROUTE_PREFIX}/${segments.join("/")}`;
}

/**
 * @description Reconstructs a compiled slug from the splat captured by the wiki route.
 * @param splat - Raw `_splat` param from a TanStack Router splat route.
 * @returns Decoded slug for `getBySlug`, or empty string.
 */
export function decodeEntitySlug(splat: string | undefined): string {
  if (!splat) {
    return "";
  }
  const urlPath = splat
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
  return urlPathToCompiledSlug(urlPath);
}
