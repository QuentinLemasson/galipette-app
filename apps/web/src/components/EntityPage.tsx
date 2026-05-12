/**
 * Entity detail page rendered for the `/entity/$` splat route.
 */

import { useParams } from "@tanstack/react-router";
import { EntityContent } from "./EntityContent";
import { NotFound } from "./NotFound";
import { useEntityBySlug } from "../hooks/useEntityBySlug";
import { decodeEntitySlug } from "../utils/source-path";

/**
 * @description Reads the splat segment from the active route, resolves the
 *   matching compiled entity by `slug`, and renders its content (or a
 *   not-found message).
 * @returns Entity content article or a not-found fallback.
 */
export function EntityPage() {
  const params = useParams({ strict: false }) as { _splat?: string };
  const slug = decodeEntitySlug(params._splat);
  const entity = useEntityBySlug(slug);

  if (!entity) {
    return (
      <NotFound
        message={
          slug
            ? `No compiled entity matched slug "${slug}".`
            : "Missing slug in URL."
        }
      />
    );
  }

  return <EntityContent entity={entity} />;
}
