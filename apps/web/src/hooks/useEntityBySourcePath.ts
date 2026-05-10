/**
 * Hook resolving a compiled entity from its `sourcePath`.
 */

import { useMemo } from "react";
import {
  contentRepository,
  type CompiledEntity,
} from "@galipette/compiled-content";

/**
 * @description Looks up a compiled entity by its source path. Computation is
 *   cached against the input so callers get a stable reference until the
 *   `sourcePath` argument changes.
 * @param sourcePath - Relative source path of the compiled entity.
 * @returns The matching `CompiledEntity`, or `undefined` if none exists.
 */
export function useEntityBySourcePath(
  sourcePath: string,
): CompiledEntity | undefined {
  return useMemo(
    () => contentRepository.getBySourcePath(sourcePath),
    [sourcePath],
  );
}
