/**
 * Sidebar file tree backed by compiled `file-tree.json`.
 */

import { FileTree } from "@galipette/ui/components/file-tree";
import { Link } from "@tanstack/react-router";

import { buildEntityHref } from "../utils/source-path";
import { useFileTree } from "../hooks/useFileTree";

/**
 * @description Renders the vault file tree from {@link contentRepository.getFileTree}
 *   with router links to entity detail pages.
 * @returns Navigation tree for the app sidebar.
 */
export function WikiFileTree() {
  const { root } = useFileTree();

  return (
    <FileTree
      root={root}
      renderEntityLink={(node) => (
        <Link
          to={buildEntityHref(node.slug)}
          className="block truncate text-inherit no-underline hover:underline"
          activeProps={{
            className: "block truncate font-medium text-sidebar-primary no-underline",
          }}
          title={node.slug}
        >
          {node.name}
        </Link>
      )}
    />
  );
}
