/**
 * Single clickable navigation entry for one compiled entity.
 */

import { Link } from "@tanstack/react-router";
import type { NavigationEntry } from "@galipette/compiled-content";
import { buildEntityHref } from "../utils/source-path";

type EntityLinkProps = {
  entry: NavigationEntry;
};

/**
 * @description Renders a router-aware `<Link>` to an entity detail page.
 *   Uses the entity's `sourcePath` to build the URL.
 * @param props - Component props.
 * @param props.entry - Navigation entry describing the target entity.
 * @returns A TanStack Router `<Link>` element.
 */
export function EntityLink({ entry }: EntityLinkProps) {
  return (
    <Link
      to={buildEntityHref(entry.sourcePath)}
      className="entity-link"
      activeProps={{ className: "entity-link entity-link--active" }}
      title={entry.sourcePath}
    >
      <span className="entity-link__name">{entry.name}</span>
      <code className="entity-link__id">{entry.id}</code>
    </Link>
  );
}
