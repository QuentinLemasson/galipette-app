/**
 * Section that lists every entity sharing the same `type` discriminator.
 */

import type { NavigationCategory } from "@galipette/compiled-content";
import { formatTypeLabel } from "../../../common/utils/format-type-label";
import { EntityLink } from "./EntityLink";

type EntityTypeSectionProps = {
  category: NavigationCategory;
};

/**
 * @description Renders a category header and the list of clickable entity entries.
 * @param props - Component props.
 * @param props.category - Navigation category produced by `getNavigationTree()`.
 * @returns Section element grouping links for one entity type.
 */
export function EntityTypeSection({ category }: EntityTypeSectionProps) {
  return (
    <section className="entity-type-section" aria-labelledby={`type-${category.type}`}>
      <header className="entity-type-section__header">
        <h2 id={`type-${category.type}`}>{formatTypeLabel(category.type)}</h2>
        <span className="entity-type-section__count">{category.entries.length}</span>
      </header>
      <ul className="entity-type-section__list">
        {category.entries.map((entry) => (
          <li key={entry.id}>
            <EntityLink entry={entry} />
          </li>
        ))}
      </ul>
    </section>
  );
}
