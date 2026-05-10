/**
 * Entity detail page rendered for the `/entity/$` splat route.
 */

import { useParams } from "@tanstack/react-router";
import { EntityContent } from "./EntityContent";
import { NotFound } from "./NotFound";
import { useEntityBySourcePath } from "../hooks/useEntityBySourcePath";
import { decodeSourcePath } from "../utils/source-path";

/**
 * @description Reads the splat segment from the active route, resolves the
 *   matching compiled entity by `sourcePath`, and renders its content (or a
 *   not-found message).
 * @returns Entity content article or a not-found fallback.
 */
export function EntityPage() {
  const params = useParams({ strict: false }) as { _splat?: string };
  const sourcePath = decodeSourcePath(params._splat);
  const entity = useEntityBySourcePath(sourcePath);

  if (!entity) {
    return (
      <NotFound
        message={
          sourcePath
            ? `No compiled entity matched source path "${sourcePath}".`
            : "Missing source path in URL."
        }
      />
    );
  }

  return <EntityContent entity={entity} />;
}
