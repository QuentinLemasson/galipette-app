/**
 * Hook exposing the compiled-content navigation tree to React components.
 */

import { useMemo } from "react";
import { contentRepository, type NavigationCategory } from "@galipette/compiled-content";

/**
 * @description Returns the cached navigation tree (entities grouped by `type`)
 *   from the compiled-content package. The tree is static for the lifetime of
 *   the bundle so this hook simply memoizes a stable reference for the caller.
 * @returns Readonly list of navigation categories.
 */
export function useNavigationTree(): readonly NavigationCategory[] {
  return useMemo(() => contentRepository.getNavigationTree(), []);
}
