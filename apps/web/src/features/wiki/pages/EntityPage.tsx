/**
 * Entity detail page rendered for the `/app/wiki/$` splat route.
 */

import { useParams } from "@tanstack/react-router";
import { useCallback } from "react";

import { NotFound } from "../../../common/components/NotFound";
import { EntityContent } from "../components/EntityContent";
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

  const debugCallback = useCallback(() => {
    console.log("slug", slug);
    console.log("entity", entity);
    console.log("params", params);
  }, [slug, entity, params]);

  if (!entity) {
    return (
      <NotFound
        message={slug ? `No compiled entity matched slug "${slug}".` : "Missing slug in URL."}
        debug={debugCallback}
      />
    );
  }

  return <EntityContent entity={entity} />;
}
