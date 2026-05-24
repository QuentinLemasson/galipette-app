/**
 * Hook exposing the compiled vault file tree to React components.
 */

import { contentRepository, type FileTree } from "@galipette/compiled-content";
import { useMemo } from "react";

/**
 * @description Returns the precompiled `file-tree.json` root via {@link contentRepository}.
 * @returns The full {@link FileTree} artifact (static for the app session).
 */
export function useFileTree(): FileTree {
  return useMemo(() => contentRepository.getFileTree(), []);
}
