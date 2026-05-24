/**
 * Sidebar file tree backed by compiled `file-tree.json`.
 */

import { FileTree } from "@galipette/ui/components/file-tree";
import { treeNavLinkVariants } from "@galipette/ui/components/tree-nav-link";
import { Link } from "@tanstack/react-router";

import { useFileTree } from "../hooks/useFileTree";
import { buildEntityHref } from "../utils/source-path";

/**
 * @description Renders the vault file tree from {@link contentRepository.getFileTree}
 *   with router links to entity detail pages.
 */
export function WikiFileTree() {
  const { root } = useFileTree();

  return (
    <FileTree
      root={root}
      renderEntityLink={(node) => (
        <Link
          to={buildEntityHref(node.slug)}
          className={treeNavLinkVariants()}
          activeProps={{
            className: treeNavLinkVariants({ active: true }),
          }}
          title={node.slug}
        >
          {node.name}
        </Link>
      )}
    />
  );
}
