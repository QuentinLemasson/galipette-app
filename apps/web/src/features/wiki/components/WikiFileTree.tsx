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
      className="group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-1 group-data-[collapsible=icon]:[&_[role=treeitem]>div]:justify-center group-data-[collapsible=icon]:[&_[role=treeitem]>div]:px-0 group-data-[collapsible=icon]:[&_button]:size-8 group-data-[collapsible=icon]:[&_button]:justify-center group-data-[collapsible=icon]:[&_button]:px-0 group-data-[collapsible=icon]:[&_span.min-w-0]:hidden group-data-[collapsible=icon]:[&_[role=group]]:items-center"
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
