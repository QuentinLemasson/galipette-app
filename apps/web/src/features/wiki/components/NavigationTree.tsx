/**
 * Top-level navigation tree: every category and its entities.
 */

import { useNavigationTree } from "../hooks/useNavigationTree";

import { EntityTypeSection } from "./EntityTypeSection";

/**
 * @description Renders the full entity navigation tree as a list of category
 *   sections. Loads its data from the compiled-content repository via
 *   `useNavigationTree`.
 * @returns Container element holding one section per entity type.
 */
export function NavigationTree() {
  const tree = useNavigationTree();

  if (tree.length === 0) {
    return (
      <p className="navigation-tree__empty">
        No compiled entities available. Run the content build first.
      </p>
    );
  }

  return (
    <div className="navigation-tree">
      {tree.map((category) => (
        <EntityTypeSection key={category.type} category={category} />
      ))}
    </div>
  );
}
